const getRecords = async (request, response) => {
    response.status(200).json({
        result: "true"
    });
};

module.exports = {
    getRecords
}