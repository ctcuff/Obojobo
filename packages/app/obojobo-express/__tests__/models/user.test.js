/* eslint-disable no-undefined */
/* eslint-disable no-new */

jest.mock('../../db')
const originalnow = Date.prototype.now
const User = oboRequire('models/user')
const db = oboRequire('db')

describe('user model', () => {
	beforeAll(() => {
		Date.now = () => 'mockNowDate'
	})
	afterAll(() => {
		Date.prototype.now = originalnow //eslint-disable-line no-extend-native
	})
	beforeEach(() => {
		jest.resetAllMocks()
	})
	afterEach(() => {})

	test('initializes expected properties', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername'
		})
		expect(u).toBeInstanceOf(User)
		expect(u.id).toBe(5)
		expect(u.firstName).toBe('Roger')
		expect(u.lastName).toBe('Wilco')
		expect(u.email).toBe('e@m.com')
		expect(u.username).toBe('someusername')
		expect(u.createdAt).toEqual('mockNowDate')
		expect(u.roles).toBeInstanceOf(Array)
		expect(u.roles).toHaveLength(0)
	})

	test('initializes permission getters', () => {
		let u

		u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName', 'otherRoleName']
		})
		expect(u.roles).toHaveLength(2)
		expect(u.canDoThing).toBe(true)
		expect(u.canDoThingOtherThing).toBe(undefined)

		u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName2', 'otherRoleName']
		})
		expect(u.roles).toHaveLength(2)
		expect(u.canDoThing).toBe(false)
		expect(u.canDoThingOtherThing).toBe(undefined)
	})

	test('hasPermission behaves', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName', 'otherRoleName']
		})

		expect(u.hasPermission('test')).toBe(false)
		expect(u.hasPermission('canDoThing')).toBe(true)
	})

	test('hasRole and hasRoles work', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName', 'otherRoleName']
		})
		expect(u.hasRole('test')).toBe(false)
		expect(u.hasRole('roleName')).toBe(true)
		expect(u.hasRole('otherRoleName')).toBe(true)

		expect(u.hasRoles(['roleName', 'otherRoleName'])).toBe(true)
		expect(u.hasRoles(['roleName'])).toBe(true)
		expect(u.hasRoles(['test', 'noway'])).toBe(false)
		expect(u.hasRoles(['roleName', 'noway'])).toBe(false)

		expect(u.hasOneOfRole([]))
	})

	test('hasRole and hasOneOfRole work', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName', 'otherRoleName']
		})
		expect(u.hasRole('test')).toBe(false)
		expect(u.hasRole('roleName')).toBe(true)
		expect(u.hasRole('otherRoleName')).toBe(true)

		expect(u.hasOneOfRole(['test'])).toBe(false)
		expect(u.hasOneOfRole(['roleName'])).toBe(true)
		expect(u.hasOneOfRole(['roleName', 'otherRoleName'])).toBe(true)
		expect(u.hasOneOfRole(['roleName', 'test'])).toBe(true)
	})

	test('responds to isGuest correctly', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName', 'otherRoleName']
		})
		expect(u.isGuest()).toBe(false)
	})

	test('saves or creates correctly', () => {
		expect.assertions(4)

		db.one.mockResolvedValueOnce({ id: 3 })

		const u = new User({
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['roleName', 'otherRoleName']
		})
		return u.saveOrCreate().then(user => {
			expect(user).toBeInstanceOf(User)
			expect(user.id).toBe(3)
			expect(db.one).toHaveBeenCalledTimes(1)
			expect(db.one.mock.calls[0]).toMatchSnapshot()
		})
	})

	test('fetches one from the database', () => {
		expect.assertions(4)

		db.one.mockResolvedValueOnce({
			id: 5,
			created_at: 'mocked-date',
			email: 'guest@obojobo.ucf.edu',
			first_name: 'Guest',
			last_name: 'Guest',
			roles: [],
			username: 'guest'
		})

		return User.fetchById(5).then(user => {
			expect(user).toBeInstanceOf(User)
			expect(user).toMatchSnapshot()
			expect(db.one).toHaveBeenCalledTimes(1)
			expect(db.one.mock.calls[0]).toMatchSnapshot()
		})
	})

	test('clearSessionsForUserById deletes sessions from the db', () => {
		db.none.mockResolvedValueOnce('')

		return User.clearSessionsForUserById(66).then(() => {
			expect(db.none).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM sessions'), {
				id: 66
			})
		})
	})

	test('throws error when not given enough arguments', () => {
		expect(() => {
			new User()
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				firstName: 'first-name'
			})
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				firstName: 'first-name',
				lastName: 'last-name'
			})
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				firstName: 'first-name',
				lastName: 'last-name',
				email: 'email'
			})
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				lastName: 'last-name'
			})
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				lastName: 'last-name',
				email: 'email'
			})
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				firstName: 'first-name',
				email: 'email'
			})
		}).toThrow('Missing arguments for new user')

		expect(() => {
			new User({
				firstName: 'first-name',
				lastName: 'last-name',
				email: 'email',
				username: 'username'
			})
		}).not.toThrow()
	})

	test('Instructor role gives expected perms', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['Instructor']
		})
		expect(u.canViewEditor).toBe(true)
		expect(u.canEditDrafts).toBe(true)
		expect(u.canDeleteDrafts).toBe(true)
		expect(u.canCreateDrafts).toBe(true)
		expect(u.canPreviewDrafts).toBe(true)
	})

	test('Administrator role gives expected perms', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['urn:lti:instrole:ims/lis/Administrator']
		})
		expect(u.canViewEditor).toBe(true)
		expect(u.canEditDrafts).toBe(true)
		expect(u.canDeleteDrafts).toBe(true)
		expect(u.canCreateDrafts).toBe(true)
		expect(u.canPreviewDrafts).toBe(true)
	})

	test('TeachingAssistant role gives expected perms', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['urn:lti:role:ims/lis/TeachingAssistant']
		})
		expect(u.canViewEditor).toBe(true)
		expect(u.canEditDrafts).toBe(true)
		expect(u.canDeleteDrafts).toBe(true)
		expect(u.canCreateDrafts).toBe(true)
		expect(u.canPreviewDrafts).toBe(true)
	})

	test('ContentDeveloper role gives expected perms', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['ContentDeveloper']
		})
		expect(u.canViewEditor).toBe(true)
		expect(u.canEditDrafts).toBe(true)
		expect(u.canDeleteDrafts).toBe(true)
		expect(u.canCreateDrafts).toBe(true)
		expect(u.canPreviewDrafts).toBe(true)
	})

	test('Learner role gives expected perms', () => {
		const u = new User({
			id: 5,
			firstName: 'Roger',
			lastName: 'Wilco',
			email: 'e@m.com',
			username: 'someusername',
			roles: ['Learner']
		})
		expect(u.canViewEditor).toBe(false)
		expect(u.canEditDrafts).toBe(false)
		expect(u.canDeleteDrafts).toBe(false)
		expect(u.canCreateDrafts).toBe(false)
		expect(u.canPreviewDrafts).toBe(false)
	})
})
