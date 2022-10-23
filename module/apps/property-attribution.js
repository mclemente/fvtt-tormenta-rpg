/**
 * Description for a single part of a property attribution.
 *
 * @typedef {object} AttributionDescription
 * @property {string} label  Descriptive label that will be displayed. If the label is in the form
 *                           of an @ property, the system will try to turn it into a human-readable label.
 * @property {number} mode   Application mode for this step as defined in
 *                           [CONST.ACTIVE_EFFECT_MODES](https://foundryvtt.com/api/module-constants.html#.ACTIVE_EFFECT_MODES).
 * @property {number} value  Value of this step.
 */

/**
 * Interface for viewing what factors went into determining a specific property.
 *
 * @extends {DocumentSheet}
 */
export default class PropertyAttribution extends Application {
	/**
	 * @param {Document} object  The Document that owns the property being attributed.
	 * @param {AttributionDescription[]} attributions  An array of all the attribution data.
	 * @param {string} property  Dot separated path to the property.
	 */
	constructor(object, attributions, property, options = {}) {
		super(options);
		this.object = object;
		this.attributions = attributions;
		this.property = property;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "property-attribution",
			classes: ["dnd5e", "property-attribution"],
			template: "systems/trpg/templates/apps/property-attribution.html",
			width: 320,
			height: "auto",
		});
	}

	/* -------------------------------------------- */

	/**
	 * Render this view as a tooltip rather than a whole window.
	 * @return {jQuery}  HTML of the rendered tooltip.
	 */
	async renderTooltip() {
		const data = this.getData(this.options);
		let html = await this._renderInner(data);
		html[0].classList.add("tooltip");
		return html;
	}

	/* -------------------------------------------- */

	getData() {
		const property = foundry.utils.getProperty(this.object.system, this.property);
		let total;
		if (Number.isNumeric(property)) {
			total = property;
		} else if (typeof property === "object" && Number.isNumeric(property.value)) {
			total = property.value;
		}

		const sources = foundry.utils.duplicate(this.attributions);
		return {
			sources: sources.map((entry) => {
				if (entry.label.startsWith("@")) {
					entry.label = this.getPropertyLabel(entry.label.slice(1));
				}
				if (entry.mode === CONST.ACTIVE_EFFECT_MODES.ADD && entry.value < 0) {
					entry.negative = true;
					entry.value = entry.value * -1;
				}
				return entry;
			}),
			total: total,
		};
	}

	/* -------------------------------------------- */

	getPropertyLabel(property) {
		const parts = property.split(".");
		if (parts[0] === "abilities" && parts[1]) {
			return CONFIG.TRPG.abilities[parts[1]];
		}
		return property;
	}
}
