import vine from '@vinejs/vine'

export const createTicketValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(10).maxLength(200),
    message: vine.string().minLength(10),
  })
)

export const createTicketMessageValidator = vine.compile(
  vine.object({
    message: vine.string().minLength(10),
  })
)

export const addMemberValidator = vine.compile(
  vine.object({
    userId: vine
      .string()
      .uuid()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return user
      }),
  })
)
