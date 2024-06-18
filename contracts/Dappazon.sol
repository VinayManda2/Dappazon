// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address payable public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier hasFunds() {
        require(address(this).balance > 0, "No funds to withdraw");
        _;
    }

    modifier paidEnough(uint256 _id) {
        require(msg.value >= items[_id].cost, "Insufficient payment");
        _;
    }

    modifier inStock(uint256 _id) {
        require(items[_id].stock > 0, "Item out of stock");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    // Adding products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        // Create new item
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        // Save item struct to blockchain
        items[_id] = item;

        // Emit an event
        emit List(_name, _cost, _stock);
    }

    // Buy product
    function buy(uint256 _id) public payable paidEnough(_id) inStock(_id) {
        // Fetch item
        Item memory item = items[_id];

        // Create an order
        Order memory order = Order(block.timestamp, item);

        // Save order to chain
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Subtract stock
        items[_id].stock--;

        // Emit event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    // Withdraw function
    function withdraw() public onlyOwner hasFunds {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
