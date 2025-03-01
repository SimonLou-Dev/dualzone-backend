import { test } from '@japa/runner'
import Sanction from '#models/sanction'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user'
import SanctionService from '#services/playerManagement/sanction_service'
import { SanctionFactory } from '#database/factories/sanction_factory'

test.group('SanctionService', () => {
  test("listSanction retourne toutes les sanctions d'un utilisateur", async ({ assert }) => {
    // Créer quelques sanctions pour le joueur
    const admin = await UserFactory.create()
    const player = await UserFactory.create()

    await SanctionFactory.merge([
      {
        userId: player.id,
        adminId: admin.id,
      },
      {
        userId: player.id,
        adminId: admin.id,
      },
      {
        userId: player.id,
        adminId: admin.id,
      },
    ]).createMany(3)

    await player.load('sanctions')

    assert.equal(player.sanctions.length, 3)
  })

  test('addWarn ajoute un avertissement à un utilisateur', async ({ assert }) => {
    const reason = 'Comportement inapproprié'

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    // Tester la méthode addWarn
    const sanction = await SanctionService.addWarn(player, admin, reason)

    // Vérifier les propriétés de la sanction créée
    assert.equal(sanction.reason, reason)
    assert.equal(sanction.duration, 0)
    assert.equal(sanction.type, 0) // Type 0 = avertissement
    assert.equal(sanction.userId, player.id)
    assert.equal(sanction.adminId, admin.id)

    // Vérifier que la sanction est bien en base de données
    const dbSanction = await Sanction.find(sanction.id)
    assert.isNotNull(dbSanction)
    assert.equal(dbSanction?.reason, reason)
  })

  test('addBan ajoute un bannissement à un utilisateur', async ({ assert }) => {
    const reason = 'Triche'
    const duration = 7 // 7 jours

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    // Tester la méthode addBan
    const sanction = await SanctionService.addBan(player, admin, reason, duration)

    // Vérifier les propriétés de la sanction créée
    assert.equal(sanction.reason, reason)
    assert.equal(sanction.duration, duration)
    assert.equal(sanction.type, 1) // Type 1 = bannissement
    assert.equal(sanction.userId, player.id)
    assert.equal(sanction.adminId, admin.id)

    // Vérifier que la sanction est bien en base de données
    const dbSanction = await Sanction.find(sanction.id)
    assert.isNotNull(dbSanction)
    assert.equal(dbSanction?.reason, reason)
    assert.equal(dbSanction?.duration, duration)
  })

  test("boolAsActiveBan retourne true si l'utilisateur a un bannissement actif permanent", async ({
    assert,
  }) => {
    // Créer un bannissement permanent (duration = 0)

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    await SanctionService.addBan(player, admin, 'Bannissement permanent', 0)

    // Vérifier que l'utilisateur a un bannissement actif
    const hasBan = await SanctionService.boolAsActiveBan(player)
    assert.isTrue(hasBan)
  })

  test("boolAsActiveBan retourne true si l'utilisateur a un bannissement actif temporaire", async ({
    assert,
  }) => {
    // Créer un bannissement temporaire de 10 jours

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    await SanctionService.addBan(player, admin, 'Bannissement temporaire', 10)

    // Vérifier que l'utilisateur a un bannissement actif
    const hasBan = await SanctionService.boolAsActiveBan(player)
    assert.isTrue(hasBan)
  })

  test('boolAsActiveBan retourne false si le bannissement est expiré', async ({ assert }) => {
    // Créer un bannissement avec une date de création antérieure

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    const sanction = new Sanction()
    sanction.reason = 'Ban expiré'
    sanction.duration = 1 // 1 jour
    sanction.type = 1
    sanction.userId = player.id
    sanction.adminId = admin.id
    sanction.createdAt = DateTime.now().minus({ days: 2 }) // Créé il y a 2 jours
    await sanction.save()

    // Vérifier que l'utilisateur n'a pas de bannissement actif
    const hasBan = await SanctionService.boolAsActiveBan(player)
    assert.isFalse(hasBan)
  })

  test("boolAsActiveBan retourne false si l'utilisateur n'a pas de bannissement", async ({
    assert,
  }) => {
    // Ajouter seulement un avertissement

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    await SanctionService.addWarn(player, admin, 'Simple avertissement')

    // Vérifier que l'utilisateur n'a pas de bannissement actif
    const hasBan = await SanctionService.boolAsActiveBan(player)
    assert.isFalse(hasBan)
  })

  test('updateSanction met à jour une sanction existante', async ({ assert }) => {
    // Créer une sanction

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    const sanction = await SanctionService.addBan(player, admin, 'Raison initiale', 5)

    // Nouvelles valeurs
    const newReason = 'Raison modifiée'
    const newDuration = 10

    // Mettre à jour la sanction
    const updatedSanction = await SanctionService.updateSanction(sanction, newReason, newDuration)

    // Vérifier les nouvelles valeurs
    assert.equal(updatedSanction.reason, newReason)
    assert.equal(updatedSanction.duration, newDuration)

    // Vérifier en base de données
    const dbSanction = await Sanction.find(sanction.id)
    assert.isNotNull(dbSanction)
    assert.equal(dbSanction?.reason, newReason)
    assert.equal(dbSanction?.duration, newDuration)
  })

  test('removeSanction supprime une sanction existante', async ({ assert }) => {
    // Créer une sanction

    const player = await UserFactory.create()
    const admin = await UserFactory.create()

    const sanction = await SanctionService.addBan(player, admin, 'À supprimer', 5)

    // Vérifier que la sanction existe
    let dbSanction = await Sanction.find(sanction.id)
    assert.isNotNull(dbSanction)

    // Supprimer la sanction
    await SanctionService.removeSanction(sanction)

    // Vérifier que la sanction n'existe plus
    dbSanction = await Sanction.find(sanction.id)
    assert.isNull(dbSanction)
  })
})
