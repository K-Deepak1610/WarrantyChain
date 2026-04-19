// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Warranty {
    struct Product {
        string productId;
        string productName;
        uint256 warrantyStart;
        uint256 warrantyEnd;
        address ownerAddress;
        string ownerName;
        uint256 createdAt;
    }

    struct OwnershipRecord {
        address ownerAddress;
        string ownerName;
        uint256 transferDate;
    }

    // Mapping from productId to Product
    mapping(string => Product) private products;
    
    // Mapping from productId to ownership history
    mapping(string => OwnershipRecord[]) private ownershipHistory;
    
    // Check if productId exists to prevent duplicates
    mapping(string => bool) private productExists;

    // Array to keep track of all registered products
    string[] private allProductIds;

    event ProductRegistered(string indexed productId, address indexed owner, uint256 timestamp);
    event OwnershipTransferred(string indexed productId, address indexed oldOwner, address indexed newOwner, uint256 timestamp);

    function registerProduct(
        string memory _productId,
        string memory _productName,
        uint256 _warrantyStart,
        uint256 _warrantyEnd,
        string memory _ownerName
    ) public {
        require(!productExists[_productId], "Product ID already registered");
        require(_warrantyEnd > _warrantyStart, "Invalid warranty dates");

        Product memory newProduct = Product({
            productId: _productId,
            productName: _productName,
            warrantyStart: _warrantyStart,
            warrantyEnd: _warrantyEnd,
            ownerAddress: msg.sender,
            ownerName: _ownerName,
            createdAt: block.timestamp
        });

        products[_productId] = newProduct;
        productExists[_productId] = true;
        allProductIds.push(_productId);

        // Add initial ownership record
        OwnershipRecord memory initialRecord = OwnershipRecord({
            ownerAddress: msg.sender,
            ownerName: _ownerName,
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

    function getProduct(string memory _productId) public view returns (
        string memory name,
        string memory ownerName,
        address owner,
        uint256 start,
        uint256 end
    ) {
        require(productExists[_productId], "Product not found");
        Product memory p = products[_productId];
        return (
            p.productName,
            p.ownerName,
            p.ownerAddress,
            p.warrantyStart,
            p.warrantyEnd
        );
    }

    function verifyWarranty(string memory _productId) public view returns (
        string memory productName,
        uint256 warrantyStart,
        uint256 warrantyEnd,
        bool isValid,
        uint256 daysRemaining,
        address ownerAddress,
        string memory ownerName
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
            p.ownerAddress,
            p.ownerName
        );
    }

    function verifyOwnership(string memory _productId) public view returns (
        address ownerAddress,
        string memory ownerName,
        OwnershipRecord[] memory history
    ) {
        require(productExists[_productId], "Product not found");
        Product memory p = products[_productId];
        return (
            p.ownerAddress,
            p.ownerName,
            ownershipHistory[_productId]
        );
    }

    function transferOwnership(
        string memory _productId,
        address _newOwner,
        string memory _newOwnerName
    ) public {
        require(productExists[_productId], "Product not found");
        Product storage p = products[_productId];
        
        require(msg.sender == p.ownerAddress, "Only owner can transfer");
        require(_newOwner != address(0), "Invalid new owner address");

        address oldOwner = p.ownerAddress;
        
        p.ownerAddress = _newOwner;
        p.ownerName = _newOwnerName;
        
        // Add new ownership record
        OwnershipRecord memory newRecord = OwnershipRecord({
            ownerAddress: _newOwner,
            ownerName: _newOwnerName,
            transferDate: block.timestamp
        });
        ownershipHistory[_productId].push(newRecord);

        emit OwnershipTransferred(_productId, oldOwner, _newOwner, block.timestamp);
    }
}
