import escape from 'escape-html'

export default class Controller {
    formatSlug = slug => {
        return this.escapeString(slug)
            .replace(/\s+/g, '-')
            .toLowerCase()
    }

    escapeString = str => {
        return escape(String(str))
    }
}
