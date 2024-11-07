const basicRequestFormat = ':date :id :remote-addr - :remote-user :method :url :status - :response-time ms :referrer :user-agent ';

const reqResBodyFormat = basicRequestFormat + '\tReq: :reqBody \tRes: :resBody';

const reqBodyFormat = basicRequestFormat + '\tReq: :reqBody';

const resBodyFormat = basicRequestFormat + '\tRes: :resBody';

module.exports = {reqResBodyFormat, basicRequestFormat, resBodyFormat};