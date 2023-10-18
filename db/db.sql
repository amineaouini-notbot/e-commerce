CREATE DATABASE ecom;
USE ecom;
CREATE TABLE client(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(230) UNIQUE NOT NULL,
    email VARCHAR(230) UNIQUE NOT NULL,
    password VARCHAR(230) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE category(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(230) NOT NULL
);

CREATE TABLE product(
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(230) NOT NULL,
    description VARCHAR(230) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY(category_id) REFERENCES category(id)
);

CREATE TABLE cart(
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE cart_items(
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);
