const Operation = require('../models/operation');

addOperation = async(request, response) => {
    try{
        var { left, operator, right } = request.body;
        const newRecord = new Operation({
            left: left,
            right: right,
            operator: operator
        });

        await newRecord.save();
        response.status(200).json({inserted: 1});

    } catch(error){
        console.log(error);
        response.status(300).json({inserted: 0});
    }
};

getOperations = async(request, response) => {
    try {
        const operations = await Operation.find().sort({createdAt: -1});
        let operation_list = [];
        operations.forEach((item) => {
            const operationAux = {
                id: item._id,
                left: item.left,
                right: item.right,
                operator: item.operator,
                timestamp: item.createdAt
            };
            
            operation_list.push(operationAux);
        });

        response.status(200).json(operation_list);

    } catch(error){
        console.log(error);
        response.status(300).json({getted: 0});
    }
};

module.exports = {
    addOperation,
    getOperations
};