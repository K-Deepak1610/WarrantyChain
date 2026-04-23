// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Warranty {
    struct Product {
        string productId;
        string productName;
        uint256 warrantyStart;
        uint256 warrantyEnd;
        address owner;
        string ownerName;
        string ownerContact;
        string serialNumber;
        string specifications;
        uint256 createdAt;
    }

    struct OwnershipRecord {
        address owner;
        string ownerName;
        string ownerContact;
        uint256 transferDate;
    }

    // Mapping from productId to Product
    mapping(string => Product) private products;
    
    // Mapping from productId to ownership history
    mapping(string => OwnershipRecord[]) private ownershipHistory;
    
    // Check if productId exists to prevent duplicates
    mapping(string => bool) private productExists;
    
    // Check if serialNumber exists
    mapping(string => bool) private serialExists;

    // Array to keep track of all registered products
    string[] private allProductIds;

    event ProductRegistered(string indexed productId, address indexed owner, uint256 timestamp);
    event OwnershipTransferred(string indexed productId, address indexed oldOwner, address indexed newOwner, uint256 timestamp);

    function registerProduct(
        string memory _productId,
        string memory _productName,
        uint256 _warrantyStart,
        uint256 _warrantyEnd,
        string memory _ownerName,
        string memory _ownerContact,
        string memory _serialNumber,
        string memory _specifications
    ) public {
        require(products[_productId].owner == address(0), "Product ID already registered");
        require(!serialExists[_serialNumber], "Serial Number already registered");
        require(_warrantyEnd > _warrantyStart, "Invalid warranty dates");

        Product memory newProduct = Product({
            productId: _productId,
            productName: _productName,
            warrantyStart: _warrantyStart,
            warrantyEnd: _warrantyEnd,
            owner: msg.sender,
            ownerName: _ownerName,
            ownerContact: _ownerContact,
            serialNumber: _serialNumber,
            specifications: _specifications,
            createdAt: block.timestamp
        });

        products[_productId] = newProduct;
        productExists[_productId] = true;
        serialExists[_serialNumber] = true;
        allProductIds.push(_productId);

        // Add initial ownership record
        OwnershipRecord memory initialRecord = OwnershipRecord({
            owner: msg.sender,
            ownerName: _ownerName,
            ownerContact: _ownerContact,
            transferDate: block.timestamp
        });
        ownershipHistory[_productId].push(initialRecord);

        emit ProductRegistered(_productId, msg.sender, block.timestamp);
    }

    function getAllProductIds() public view returns (string[] memory) {
        return allProductIds;
    }

    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](allProductIds.length);
        for (uint i = 0; i < allProductIds.length; i++) {
            allProducts[i] = products[allProductIds[i]];
        }
        return allProducts;
    }

    function getProduct(string memory _productId) public view returns (Product memory) {
        require(productExists[_productId], "Product not found");
        return products[_productId];
    }

    function verifyWarranty(string memory _productId) public view returns (
        string memory productName,
        uint256 warrantyStart,
        uint256 warrantyEnd,
        bool isValid,
        uint256 daysRemaining,
        address owner,
        string memory ownerName,
        string memory ownerContact,
        string memory serialNumber,
        string memory specifications
    ) {
        require(productExists[_productId], "Product not found");
        Product memory p = products[_productId];

        bool isWarrantyValid = (block.timestamp <= p.warrantyEnd);
        uint256 remaining = 0;
        
        if (isWarrantyValid) {
            remaining = (p.warrantyEnd - block.timestamp) / 1 days;
        }

        return (
            p.productName,
            p.warrantyStart,
            p.warrantyEnd,
            isWarrantyValid,
            remaining,
            p.owner,
            p.ownerName,
            p.ownerContact,
            p.serialNumber,
            p.specifications
        );
    }

    function verifyOwnership(string memory _productId) public view returns (
        address currentOwner,
        string memory currentOwnerName,
        OwnershipRecord[] memory history
    ) {
        require(productExists[_productId], "Product not found");
        Product memory p = products[_productId];
        return (
            p.owner,
            p.ownerName,
            ownershipHistory[_productId]
        );
    }

    function transferOwnership(
        string memory _productId,
        address _newOwner,
        string memory _newOwnerName,
        string memory _newOwnerContact
    ) public {
        require(productExists[_productId], "Product not found");
        Product storage p = products[_productId];
        
        require(msg.sender == p.owner, "Not the owner");
        require(_newOwner != address(0), "Invalid new owner address");

        address oldOwner = p.owner;
        
        p.owner = _newOwner;
        p.ownerName = _newOwnerName;
        p.ownerContact = _newOwnerContact;
        
        // Add new ownership record
        OwnershipRecord memory newRecord = OwnershipRecord({
            owner: _newOwner,
            ownerName: _newOwnerName,
            ownerContact: _newOwnerContact,
            transferDate: block.timestamp
        });
        ownershipHistory[_productId].push(newRecord);

        emit OwnershipTransferred(_productId, oldOwner, _newOwner, block.timestamp);
    }
}
