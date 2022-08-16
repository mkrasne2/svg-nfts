// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./VRFConsumerBaseV2.sol";
import "./VRFCoordinatorV2Interface.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import { StringUtils } from "./stringUtils.sol";
import {Base64} from "./Base64.sol";

contract SVGNFT is ERC721URIStorage, VRFConsumerBaseV2 {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter public _svgIdCounter;
    uint[] public minted;

    event CreatedNFT(uint256 indexed tokenId, string tokenURI);
    event SVGCreated(address indexed requester, string indexed svg);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    //needed for randomizer
    uint256 private constant ROLL_IN_PROGRESS = 500000;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;
    uint256 public s_requestId;

    mapping(uint256 => uint256[]) public s_requestIdToRandomWords;
    mapping(address => uint256) public s_requestIdToAddress;
    //map 1 for true and unset for false
      
    
    constructor(uint64 subscriptionId) 
    ERC721("SVG NFT", "sNFT") 
    VRFConsumerBaseV2(vrfCoordinator)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    
    function requestRandomWords()  external  returns (uint256) {
    // Will revert if subscription is not set and funded.
    uint256 requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
     s_requestIdToAddress[msg.sender] = requestId;

  // Store the latest requestId for this example.
  s_requestId = requestId;

  // Return the requestId to the requester.
  return requestId;
  }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        s_requestIdToRandomWords[requestId] = randomWords;
        emit DiceLanded(requestId, randomWords[0]);
    }

    

    function createNFT() public returns (string memory){
        require(s_requestIdToRandomWords[s_requestIdToAddress[msg.sender]][0] > 0);
        uint256 input = s_requestIdToRandomWords[s_requestIdToAddress[msg.sender]][0];
        //reset user input
        delete s_requestIdToRandomWords[s_requestIdToAddress[msg.sender]][0];
        delete s_requestIdToAddress[msg.sender];
        uint256[] memory nums = expand(input, 36);
        string[3] memory colorsArr = colors(nums);
        string[2] memory widthAndPoints = concats(nums);
        string memory svgPartOne = _addThreeUnits('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" style="background-color:#', colorsArr[0], '"> ');
        string memory svgPartTwo = _addThreeUnits('<polygon points="', widthAndPoints[1], '" style="fill:#');
        string memory svgPartThree = _addThreeUnits(colorsArr[1], ';stroke:#', colorsArr[2]);
        string memory svgPartFour = _addThreeUnits(';stroke-width: ', widthAndPoints[0], '" />Sorry, your browser does not support inline SVG. </svg>');
        string memory finalS = string(abi.encodePacked(svgPartOne, svgPartTwo, svgPartThree, svgPartFour));
        emit SVGCreated(msg.sender, finalS);
       create(finalS, msg.sender);
       return finalS;
    }


    function colors(uint256[] memory nums) internal pure returns (string[3] memory) {
        string[6] memory checkColors = ['a', 'b', 'c', 'd', 'e', 'f'];
        string memory fill;
        string memory stroke;
        string memory bColor;
        for(uint i = 0; i < 18; i++){
            uint256 d15Value = (nums[i] % 15);
            string memory addString;
            if(d15Value > 9){
                addString = checkColors[d15Value - 10];
                
            }
            if(d15Value <= 9){
                addString =  Strings.toString(d15Value);
            }
            if(i <= 5){
                string memory newString = string(abi.encodePacked(fill,addString));
                fill = newString;
            }
            if(i >= 6 && i < 12){
                string memory newString = string(abi.encodePacked(stroke,addString));
                stroke = newString;
            }
            if(i >= 12){
                string memory newString = string(abi.encodePacked(bColor,addString));
                bColor = newString;
            }
        }
        
        return [fill, stroke, bColor];
    }


    function concats(uint256[] memory nums) internal pure returns (string[2] memory) {
        string memory points;
        string memory sWidth = Strings.toString(nums[19] % 200);
        uint256 pointNum = ((nums[19] % 5) + 3) * 2;
        

        for(uint i = 0; i < pointNum; i++){
            uint256 d400Value = (nums[(i+1) + 19] % 400);
            string memory converted = (Strings.toString(d400Value));
            if(i == 0){
                points = string(abi.encodePacked(converted,","));
            }
            if(i % 2 != 0){
                string memory newString = string(abi.encodePacked(points, converted, " "));
                points = newString;
            }
            if((i > 0) && i % 2 == 0){
                string memory newString = string(abi.encodePacked(points, converted, ","));
                points = newString;
            }
            
        }
        return [sWidth, points];
    }

    
    function _addThreeUnits(string memory a, string memory b, string memory c) private pure returns(string memory) {
        return string(abi.encodePacked(a, b, c));
    }

    function expand(uint256 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
    expandedValues = new uint256[](n);
    for (uint256 i = 0; i < n; i++) {
        expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
    }
    return expandedValues;
}

    function create(string memory svg, address newOwner) internal {
        uint256 svgId = _svgIdCounter.current();
        _safeMint(newOwner, svgId);
        string memory imageURI = svgToImageURI(svg);
        string memory tokenURI = formatTokenURI(imageURI);
        _setTokenURI(svgId, tokenURI);
        minted.push(svgId);
        emit CreatedNFT(svgId, tokenURI);
        _svgIdCounter.increment();
    } 

    function svgToImageURI(string memory svg) public pure returns (string memory _uri) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded));
        _uri = imageURI;
    }

     function formatTokenURI(string memory imageURI) public pure returns (string memory) {
        return string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                "SVG NFT " , 
                                '", "description":"An NFT based on SVG!", "attributes":"", "image":"',imageURI,'"}'
                            )
                        )
                    )
                )
            );
    }
    
}

