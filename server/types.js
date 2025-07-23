const z = require("zod");

const UserSchema = z.object({
    username: z.string(),
    password: z.string()
})

module.exports = UserSchema;