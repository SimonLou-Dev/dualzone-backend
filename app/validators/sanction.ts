import vine from '@vinejs/vine'

export const createBanValidator = vine.compile(
  vine.object({
    reason: vine.string().minLength(10).maxLength(200),
    duration: vine.number().min(0),
  })
)

export const createWarnValidator = vine.compile(
  vine.object({
    reason: vine.string().minLength(10).maxLength(200),
  })
)

export const updateSanctionValidator = vine.compile(
  vine.object({
    reason: vine.string().minLength(10).maxLength(200),
    duration: vine.number().min(0),
  })
)
