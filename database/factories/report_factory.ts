import factory from '@adonisjs/lucid/factories'
import Report from '#models/report'

export const ReportFactory = factory
  .define(Report, async () => {
    return {}
  })
  .build()
