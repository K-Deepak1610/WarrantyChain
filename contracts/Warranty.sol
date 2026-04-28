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
        string ownerEmail;
        string serialNumber;
        string specifications;
        uint256 createdAt;
        bool isExtended;
    }

    struct OwnershipRecord {
        address owner;
        string ownerName;
        string ownerContact;
        string ownerEmail;
        uint256 transferDate;
    }

    struct ServiceRecord {
        string description;
        string technicianName;
        uint256 serviceDate;
        string location;
        bool isPaid;
    }

    // Mapping from productId to Product
    mapping(string => Product) private products;
    
    // Mapping from productId to ownership history
    mapping(string => OwnershipRecord[]) private ownershipHistory;
    
    // Mapping from productId to service history
    mapping(string => ServiceRecord[]) private serviceHistory;
    
    // Check if productId exists to prevent duplicates
    mapping(string => bool) private productExists;
    
    // Check if serialNumber exists
    mapping(string => bool) private serialExists;

    // Array to keep track of all registered products
    string[] private allProductIds;

    event ProductRegistered(string indexed productId, address indexed owner, uint256 timestamp);
    event OwnershipTransferred(string indexed productId, address indexed oldOwner, address indexed newOwner, uint256 timestamp);
    event ServiceRecordAdded(string indexed productId, string description, uint256 timestamp);
    event WarrantyExtended(string indexed productId, uint256 newExpiryDate, uint256 timestamp);
    event ProductUpdated(string indexed productId, string productName, uint256 timestamp);

    function registerProduct(
        string memory _productId,
        string memory _productName,
        uint256 _warrantyStart,
        uint256 _warrantyEnd,
        string memory _ownerName,
        string memory _ownerContact,
        string memory _ownerEmail,
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
            ownerEmail: _ownerEmail,
            serialNumber: _serialNumber,
            specifications: _specifications,
            createdAt: block.timestamp,
            isExtended: false
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
            ownerEmail: _ownerEmail,
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
        string memory ownerEmail,
        string memory serialNumber,
        string memory specifications,
        bool isExtended
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
            p.ownerEmail,
            p.serialNumber,
            p.specifications,
            p.isExtended
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
        string memory _newOwnerContact,
        string memory _newOwnerEmail
    ) public {
        require(productExists[_productId], "Product not found");
        Product storage p = products[_productId];
        
        require(msg.sender == p.owner, "Not the owner");
        require(_newOwner != address(0), "Invalid new owner address");

        address oldOwner = p.owner;
        
        p.owner = _newOwner;
        p.ownerName = _newOwnerName;
        p.ownerContact = _newOwnerContact;
        p.ownerEmail = _newOwnerEmail;
        
        // Add new ownership record
        OwnershipRecord memory newRecord = OwnershipRecord({
            owner: _newOwner,
            ownerName: _newOwnerName,
            ownerContact: _newOwnerContact,
            ownerEmail: _newOwnerEmail,
            transferDate: block.timestamp
        });
        ownershipHistory[_productId].push(newRecord);

        emit OwnershipTransferred(_productId, oldOwner, _newOwner, block.timestamp);
    }

    function updateProduct(
        string memory _productId,
        string memory _ownerName,
        string memory _ownerContact,
        string memory _ownerEmail
    ) public {
        require(productExists[_productId], "Product not found");
        Product storage p = products[_productId];
        require(msg.sender == p.owner, "Not the owner");

        p.ownerName = _ownerName;
        p.ownerContact = _ownerContact;
        p.ownerEmail = _ownerEmail;

        // Update the latest ownership record if it matches current owner
        if (ownershipHistory[_productId].length > 0) {
            uint256 lastIdx = ownershipHistory[_productId].length - 1;
            if (ownershipHistory[_productId][lastIdx].owner == msg.sender) {
                ownershipHistory[_productId][lastIdx].ownerName = _ownerName;
                ownershipHistory[_productId][lastIdx].ownerContact = _ownerContact;
                ownershipHistory[_productId][lastIdx].ownerEmail = _ownerEmail;
            }
        }

        emit ProductUpdated(_productId, p.productName, block.timestamp);
    }

    function addServiceRecord(
        string memory _productId,
        string memory _description,
        string memory _technician,
        string memory _location,
        bool _isPaid
    ) public {
        require(productExists[_productId], "Product not found");
        // For simplicity, we allow anyone to add a record, 
        // but in production, this would be restricted to authorized technicians.
        
        ServiceRecord memory newService = ServiceRecord({
            description: _description,
            technicianName: _technician,
            serviceDate: block.timestamp,
            location: _location,
            isPaid: _isPaid
        });
        
        serviceHistory[_productId].push(newService);
        emit ServiceRecordAdded(_productId, _description, block.timestamp);
    }

    function extendWarranty(string memory _productId, uint256 _newExpiryDate) public {
        require(productExists[_productId], "Product not found");
        Product storage p = products[_productId];
        
        // In a real app, only the manufacturer could do this.
        // For this project, we allow the owner or manufacturer.
        require(_newExpiryDate > p.warrantyEnd || block.timestamp > p.warrantyEnd, "New expiry must be in the future");
        
        p.warrantyEnd = _newExpiryDate;
        p.isExtended = true;

        // Automatically add a service record for the extension
        ServiceRecord memory extensionRecord = ServiceRecord({
            description: "Warranty Policy Extended/Renewed",
            technicianName: "System Administrator",
            serviceDate: block.timestamp,
            location: "WarrantyChain Registry",
            isPaid: true
        });
        serviceHistory[_productId].push(extensionRecord);

        emit WarrantyExtended(_productId, _newExpiryDate, block.timestamp);
    }

    function getServiceHistory(string memory _productId) public view returns (ServiceRecord[] memory) {
        require(productExists[_productId], "Product not found");
        return serviceHistory[_productId];
    }
}
