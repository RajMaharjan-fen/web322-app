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
        let publishedItems = items.filter((item) => item.published === true);
        publishedItems.length > 0
            ? resolve(publishedItems)
            : reject("No published items found");
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        categories.length > 0
            ? resolve(categories)
            : reject("No categories found");
    });
};

module.exports.addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        itemData.postDate = new Date().toISOString().split("T")[0];
        items.push(itemData);

        fs.writeFile("./data/items.json", JSON.stringify(items, null, 2), (err) => {
            if (err) {
                reject("Unable to save item");
            } else {
                resolve(itemData);
            }
        });
    });
};

module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter((item) => item.category.toString() === category.toString());
        filteredItems.length > 0
            ? resolve(filteredItems)
            : reject("No results returned");
    });
};

module.exports.getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(
            (item) => new Date(item.postDate) >= new Date(minDateStr)
        );
        filteredItems.length > 0
            ? resolve(filteredItems)
            : reject("No results returned");
    });
};

module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        let foundItem = items.find((item) => item.id === parseInt(id));
        foundItem ? resolve(foundItem) : reject("No result returned");
    });
};
