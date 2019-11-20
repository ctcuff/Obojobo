jest.mock('../config')
jest.mock('../viewer/viewer_state', () => ({
	set: jest.fn(),
	setRedAlert: jest.fn()
}))
jest.mock('../obo_events', () => ({ on: jest.fn(), emit: jest.fn() }))
jest.mock('../models/visit')

const mockEvent = {
	userId: 'mockUserId',
	draftId: 'mockDraftId',
	contentId: 'mockContentId',
	visitId: 'mockVisitId',
	createdAt: 'mockCreatedAt',
	payload: {
		open: 'yep',
		redAlert: 'mockValue'
	}
}
let vs
let ve
let oboEvents
let VisitModel

describe('viewer events', () => {
	beforeAll(() => {})
	afterAll(() => {})
	beforeEach(() => {
		jest.resetModules()
		vs = oboRequire('viewer/viewer_state')
		oboEvents = oboRequire('obo_events')
		VisitModel = oboRequire('models/visit')
	})
	afterEach(() => {})

	test('registers expected events', () => {
		expect(oboEvents.on).not.toBeCalled()

		ve = oboRequire('viewer_events')
		expect(oboEvents.on).toBeCalledWith('client:nav:open', expect.any(Function))
		expect(oboEvents.on).toBeCalledWith('client:nav:close', expect.any(Function))
		expect(oboEvents.on).toBeCalledWith('client:nav:redAlert', expect.any(Function))
		expect(oboEvents.on).toHaveBeenCalledTimes(3)
	})

	test('executes next when included to support express middleware', () => {
		ve = oboRequire('viewer_events')
		const mockNext = jest.fn()
		ve({}, {}, mockNext)
		expect(mockNext).toBeCalled()
	})

	test('client:nav:open', () => {
		expect.hasAssertions()
		ve = oboRequire('viewer_events')

		const [eventName, callback] = oboEvents.on.mock.calls[0]
		expect(eventName).toBe('client:nav:open')
		expect(callback).toHaveLength(1) // callback has 1 argument

		VisitModel.fetchById.mockResolvedValueOnce({
			resource_link_id: 'mockResourceLinkId'
		})

		expect(vs.set).not.toHaveBeenCalled()
		return callback(mockEvent).then(() => {
			expect(vs.set).toBeCalledWith(
				'mockUserId',
				'mockDraftId',
				'mockContentId',
				'nav:isOpen',
				1,
				true,
				'mockResourceLinkId'
			)
		})
	})

	test('client:nav:close', () => {
		expect.hasAssertions()
		ve = oboRequire('viewer_events')

		const [eventName, callback] = oboEvents.on.mock.calls[1]
		expect(eventName).toBe('client:nav:close')
		expect(callback).toHaveLength(1) // callback has 1 argument

		VisitModel.fetchById.mockResolvedValueOnce({
			resource_link_id: 'mockResourceLinkId'
		})

		expect(vs.set).not.toHaveBeenCalled()
		return callback(mockEvent).then(() => {
			expect(vs.set).toBeCalledWith(
				'mockUserId',
				'mockDraftId',
				'mockContentId',
				'nav:isOpen',
				1,
				false,
				'mockResourceLinkId'
			)
		})
	})

	test('client:nav:redAlert', () => {
		expect.hasAssertions()
		ve = oboRequire('viewer_events')
		const [eventName, callback] = oboEvents.on.mock.calls[2]

		expect(eventName).toBe('client:nav:redAlert')
		expect(callback).toHaveLength(1) // callback has 1 argument

		callback(mockEvent)

		expect(vs.setRedAlert).toBeCalledWith(
			'mockUserId',
			'mockDraftId',
			'mockContentId',
			'mockCreatedAt',
			'mockValue'
		)
	})
})
