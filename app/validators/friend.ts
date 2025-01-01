import vine from '@vinejs/vine'


export const requestFriendshipValidator = vine.compile(
  vine.object({
    userId: vine
      .string()
      .uuid()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return user
      })

  })
)
