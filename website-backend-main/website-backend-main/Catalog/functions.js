class Functions {
    convertUrlImageToPath(imageUrl, dir) {
        let fileToDelete = imageUrl;
        // const arrayFileToDelete = fileToDelete.split("/");
        // fileToDelete = arrayFileToDelete[arrayFileToDelete.length - 1];
        fileToDelete = dir + "/" + fileToDelete;
        return fileToDelete;
    }
}

module.exports = Functions; 
