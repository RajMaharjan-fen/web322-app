const fs = require("fs");

let items = [];
let categories = [];

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) reject("Unable to read items.json");
            items = JSON.parse(data);

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) reject("Unable to read categories.json");
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
};

module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        items.length > 0 ? resolve(items) : reject("No items found");
    });
};

module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        let publishedItems = items.filter(item => item.published === true);
        publishedItems.length > 0 ? resolve(publishedItems) : reject("No published items found");
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        categories.length > 0 ? resolve(categories) : reject("No categories found");
    });
};
