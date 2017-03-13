let DraftNode = oboRequire('models/draft_node')
let db = oboRequire('db');
let express = require('express');
let app = express();
app.on('render:viewer', function(oboGlobals) {
	console.log('RENDER VIEWER', oboGlobals);
	oboGlobals.set('alpha', 'string');
	oboGlobals.set('beta', 123);
	oboGlobals.set('omega', { x:1 });
});

class Assessment extends DraftNode {
	// static getAttemptObjectFromDbRow(dbRow) {
	// 	return ({
	// 		attemptId: dbRow.id,
	// 		assessmentId: dbRow.assessment_id,
	// 		draftId: dbRow.draft_id,
	// 		startTime: dbRow.created_at,
	// 		endTime: dbRow.completed_at,
	// 		questions: dbRow.state.questions,
	// 		data: dbRow.state.data,
	// 		result: dbRow.result
	// 	})
	// }

	static getAttemptHistory(userId, draftId) {
		return (
			db.manyOrNone(`
				SELECT
					id AS "attemptId",
					created_at as "startTime",
					completed_at as "endTime",
					assessment_id as "assessmentId",
					state,
					result
				FROM attempts
				WHERE user_id = $1
				AND draft_id = $2
				ORDER BY completed_at DESC`
			, [userId, draftId])
		)
	}

	static insertNewAttempt(userId, draftId, assessmentId, state) {
		return (
			db.one(`
				INSERT INTO attempts (user_id, draft_id, assessment_id, state)
				VALUES($[userId], $[draftId], $[assessmentId], $[state])
				RETURNING
				id AS "attemptId",
				created_at as "startTime",
				completed_at as "endTime",
				assessment_id as "assessmentId",
				state,
				result
			`, {
				userId: userId,
				draftId: draftId,
				assessmentId: assessmentId,
				state: state
			})
		)
	}

	static updateAttempt(result, attemptId)
	{
		return (
			db.one(`
				UPDATE attempts
				SET completed_at = now(), result = $1
				WHERE id = $2
				RETURNING
				id AS "attemptId",
				created_at as "startTime",
				completed_at as "endTime",
				assessment_id as "assessmentId",
				state,
				result
			`, [result, attemptId])
		)
	}

	constructor(draftTree, node, initFn) {
		super(draftTree, node, initFn)
		this.registerEvents({
			'internal:sendToClient' : this.onSendToClient,
			'internal:renderViewer' : this.onRenderViewer
		})
	}

	onSendToClient(req, res){
		console.log('yup')
		return this.yell('ObojoboDraft.Sections.Assessment:sendToClient', req, res)
	}

	onRenderViewer(req, res, oboGlobals) {
		return (
			this.constructor.getAttemptHistory(4, req.params.draftId)
			.then( (attemptHistory) => {
				oboGlobals.set('ObojoboDraft.Sections.Assessment:attemptHistory', attemptHistory)
				return Promise.resolve()
			})
		)
	}
}

module.exports = Assessment
