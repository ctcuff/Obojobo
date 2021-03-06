import './delete-button.scss'

import Common from 'obojobo-document-engine/src/scripts/common'
import React from 'react'

class DeleteButton extends React.Component {
	constructor(props) {
		super(props)
		this.deleteButtonRef = React.createRef()
	}

	static get defaultProps() {
		return { indent: 0 }
	}

	focus() {
		Common.page.focus(this.deleteButtonRef)
	}

	render() {
		return (
			<div className="obojobo-draft--components--delete-button">
				<button
					ref={this.deleteButtonRef}
					onClick={this.props.onClick}
					tabIndex={this.props.shouldPreventTab ? '-1' : this.props.tabIndex}
					disabled={this.props.shouldPreventTab}
				>
					{this.props.label || 'Delete'}
				</button>
			</div>
		)
	}
}

export default DeleteButton
