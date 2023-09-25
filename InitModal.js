let modal_container = $('.modals-container');

if (!modal_container.length)
	$('<div class="modals-container"></div>').insertAfter('.main');

$(document).off('show.bs.modal', '.modal');
$(document).on('show.bs.modal', '.modal', function() {
	let modal = $(this);
	let id = modal.attr('id');

	setTimeout(function() {
		$.each($(`.modal-backdrop`), function() {
			let backdrop = $(this);
			if (backdrop.attr('data-id') === undefined) {
				backdrop.attr('data-id', id);
			}
		})
	})
});

$(document).off('hide.bs.modal', '.modal');
$(document).on('hide.bs.modal', '.modal', function(e) {
	let id = e.target.id;
	
	if ($(`.modals-container`).find(`.modal#${id}`).length === 1) {
		if ($(`.modal#${id}`).length) {
			setTimeout(function() {
				$(`.modal#${id}`).remove();
				$(`.modal-backdrop[data-id="${id}"]`).remove();
				$('body').css('overflow', '');
			}, 400);
		}
	}
});

/*-----------------------------------------------------------------------------------------------*
*																								 *
*								          MODAL CREATION							             *
*																								 *
*								      Settings Parameter:                                        *
*				->	id: modal_id  (Required)												     *
*				->	type: options [ 'Error', 'Success', 'Information', ...]			             *
*				->	draggable: boolean (Draggable Modal)       									 *
*				->	scrollable: boolean (Scrollable Modal)										 *
*				->	static: boolean (Adds a backdrop, preventing the modal from closing when	 *
*							when clicking outside the modal)       								 *
*				->	position: empty is default, 'center' for position: center       			 *
*				->	size: modal size options [ 'sm', 'lg', 'xl' ] 						 		 *
*				->	hasClose: Boolean value, true if you want your modal 						 *
*							  to have close button in Modal Header								 *
*				->	title: modal title													 		 *
*				->	msg: modal content 													 		 *
*				->	buttons = object value (Key, Callback) 										 *
*					E.g.:	buttons: { 'Yes': function() {} }		 							 *
*								 	 															 *			
*																								 *
*																								 *
*------------------------------------------------------------------------------------------------*/
class Modal {
	#id = '';
	#size = '';
	#type = '';
	#position = '';
	#draggable = false;
	#scrollable = false;
	#static = false;
	#title = '';
	#msg = '';
	#buttons = '';
	#hasClose = true;
	#header = true;
	#footer = true;

	#modal_buttons = [];

	constructor(settings = { type: '', id: '', size: '', static: false, draggable: false, scrollable: false, staticType: true, header: true, footer: true, hasClose: true, position: '', title: '', msg: '', buttons: {} }) {
		this.setId(settings.id);
		this.setType(settings.type);
		this.setSize(settings.size);
		this.setPosition(settings.position);
		this.setDraggable(settings.draggable);
		this.setHasClose(settings.hasClose);
		this.setScrollable(settings.scrollable);
		this.setStatic(settings.static);
		this.setTitle(settings.title);
		this.setMessage(settings.msg);
		this.setButtons(settings.buttons);
		this.setHeader(settings.header);
		this.setFooter(settings.footer);
	}

	setId(id) {
		if (!id)
			throw "Modal Id is required";

		this.#id = id;
		this.modal_instance = id;

		return this;
	}

	setSize(size = '') {
		let sizes = [ 'sm', 'lg', 'xl' ];

		if (size !== '')
			if (!sizes.includes(size))
				throw `Modal size: ${size} is invalid! Options [ 'sm', 'lg', 'xl' ]`;

		this.#size = (size === '') ? '' : ` modal-${size}`;

		return this;
	}

	setType(type = 'Default') {
		let types = {  'Error': 'bg-danger text-white', 
					   'Success': 'bg-success text-white', 
					   'Information': 'modal-bg-default text-white', 
					   'Warning': 'bg-warning text-white',
					   'Default': 'bg-secondary text-white' 
					};

		if (!ucFirst(type) in types)
			throw 'Modal type is invalid';

		this.#type = ` ${types[ucFirst(type)]}`;

		return this;
	}

	setPosition(position = '') {
		if (position != '' && position != 'center')
			throw `Modal position: ${position} is invalid! Position options [ default (''), center ]`;

		this.#position = (position === 'center') ? ' modal-dialog-centered' : '';

		return this;
	}

	setDraggable(draggable = false) {
		this.#draggable = draggable;

		return this;
	}

	setScrollable(scrollable = false) {
		this.#scrollable = (scrollable) ? ' modal-dialog-scrollable' : '';

		return this;
	}

	setStatic(isStatic = false) {
		this.#static = isStatic;

		return this;
	}

	setTitle(title = '') {
		this.#title = title;

		return this;
	}

	setMessage(msg) {
		this.#msg = msg;

		return this;
	}

	setButtons(buttons) {
		this.#buttons = buttons;

		return this;
	}

	setHasClose(hasClose = true) {
		this.#hasClose = hasClose;

		return this;
	}

	setHeader(header = true) {
		this.#header = header;

		return this;
	}

	setFooter(footer = true) {
		this.#footer = footer;
		
		return this;
	}

	get #getId() { return this.#id };
	get #getSize() { return this.#size }
	get #getType() { return this.#type }
	get #getPosition() { return this.#position }
	get #getDraggable() { return this.#draggable }
	get #getScrollable() { return this.#scrollable }
	get #getStatic() { return this.#static }
	get #getTitle() { return this.#title }
	get #getMessage() { return this.#msg }
	get #getButtons() { return this.#buttons }
	get #getHasClose() { return this.#hasClose }
	get #getHasHeader() { return this.#header }
	get #getHasFooter() { return this.#footer }

	init() {
		let closeButtons = [ 'Cancel', 'Close', 'Exit', 'No' ];

		let staticModal = 'data-bs-backdrop="false"';
		if (this.#getStatic)
			staticModal = 'data-bs-backdrop="static"';

		let buttonId = '';
		let buttonsBuilder = '';

		let modalId = this.#getId;

		let bind_button_list = {};

		$.each(this.#getButtons, function(button_name, callback) {
			let button_id = button_name.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            button_id = `modal-${modalId}-${button_id}`;

			bind_button_list[button_id] = callback;

			if (closeButtons.includes(ucFirst(button_name))) {
				buttonsBuilder += `<button type="button" id="${button_id}" effect="ripple" class="btn btn-secondary btn-sm py-0" data-bs-dismiss="modal">${button_name}</button>`
			} else {
				buttonsBuilder += `<button type="button" id="${button_id}" effect="ripple" class="btn btn-primary btn-sm py-0">${button_name}</button>`
			}
		});

		let close = '';
		if (this.#getHasClose) {
			close = `<button type="button" class="btn btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>`
		}

		let modal = `<div class="modal fade" id="modal-${this.#getId}" ${staticModal} data-bs-keyboard="false" role="dialog" tabindex="-1" data-draggable="${this.#getDraggable}">`
		modal += 		`<div class="modal-dialog${this.#getPosition}${this.#getSize}${this.#getScrollable}">`
		modal +=			`<div class="modal-content">`

		if (this.#getHasHeader) {
			modal +=			`<div class="modal-header${this.#getType} pt-1 pb-1">
									<span class="modal-title fs-6" id="backdropLabel">${this.#getTitle}</span>
									${close}
								</div>`
		}

		modal += 				`<div class="modal-body">
									<div class="modal-onprogress-bar" style="display: none;">
										<div class="line"></div><div class="subline inc"></div>
										<div class="subline dec"></div>
									</div>
									<div class="modal-onprogress-overlay"></div>
									${this.#getMessage}
								</div>`;

		if (this.#getHasFooter) {
			modal +=			`<div class="modal-footer py-1">${buttonsBuilder}</div>`;
		}

		modal += 			`</div>`
		modal +=		`</div>`

		modal 	 += `</div`;

		$('.modals-container').append(modal);

		let self = this;
		$.each(bind_button_list, function(id, callback) {
			self.on('click', id, callback);
		});

		$(`.modal#modal-${this.#getId}`).modal('toggle');

		$('[data-draggable="true"].modal').draggable()

		return this;
	}

	// Add Eventlistener to the current Modal
	/*
	Params:
		@event = EventListener
		@target = Target Element
		@callback = Callback function, do stuff here
	*/
	on(event, target, callback) {
		if (!(target instanceof jQuery)) {
			target = $(`#${target}`);
		}

        target.off(`${event}`);
        target.on(`${event}`, callback)

        return this;
    }

	// Click event for Modal-related buttons here
	/*
	Params:
		@target = Here you can pass the Name of the button
		@callback = Callback function
	*/
	click(target, callback) {
		if (!(target instanceof jQuery)) {
			target = $(`#${target}`)
		}

		target.off('click');
		target.on('click', callback);

		return this;
	}

	// Dispose Modal on close
	static close(modal) {
		$(`.modal#${modal}`).modal('hide');

		setTimeout(function() {
			$(`.modal#${modal}`).remove();
		}, 300);

		setTimeout(function() {
			$(`.modal-backdrop[data-id="${modal}"]`).remove();
			$(`body`).css('overflow', '');
		}, 400)
	}

	close() {
		$(`.modal#modal-${this.modal_instance}`).modal('hide');

		setTimeout(function() {
			$(`.modal[id="modal-${this.modal_instance}"]`).remove();
		}, 300);
	}
}

class InitModal extends Modal {
	constructor(properties = { id, title, msg, size, buttons }) {

		if (!properties.id) {
			throw `Modal Id is required`;
		}

		if (!properties.title) {
			throw `Modal Title is required`;
		}

		if (!properties.msg) {
			throw `Modal Message is required`;
		}

		if (!properties.size) {
			properties.size = '';
		}

		if (!properties.buttons) {
			throw `Modal need at least one button`;
		}
		
		super({
			id: properties.id,
			size: properties.size,
			position: 'center',
			static: true,
			title: properties.title,
			msg: properties.msg,
			buttons: properties.buttons
		});

		super.init();
	}
}

class InfoModal extends Modal {
	constructor(title, msg, size = '') {
		super({ 
			id: 'information', 
			type: 'Information', 
			size, 
			position: 'center',  
			static: true,
			title,
			msg,
			buttons: {
				OK: ''
			}
		});

		super.init();
	}
}

class SuccessModal extends Modal {
	constructor(title, msg, size = '') {
		super({ 
			id: 'success', 
			type: 'Success', 
			size, 
			position: 'center',  
			static: true,
			title,
			msg,
			buttons: [ { id: 'close', name: 'Close' } ]
		});

		super.init();
	}
}

class WarningModal extends Modal {
	constructor(title, msg, size = '') {
		super({ 
			id: 'warning', 
			type: 'Warning', 
			size, 
			position: 'center',  
			static: true,
			title,
			msg,
			buttons: {
				Close: ''
			}
		});

		super.init();
	}
}

class ErrorModal extends Modal {
	constructor(title, msg, size = '') {
		super({ 
			id: 'error', 
			type: 'Error', 
			size, 
			position: 'center',  
			static: true,
			title,
			msg,
			buttons: [ { id: 'close', name: 'Close' } ]
		});

		super.init();
	}
}