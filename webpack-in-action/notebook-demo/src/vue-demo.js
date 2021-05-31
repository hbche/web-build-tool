import Vue from 'vue';

import { parse } from 'markdown';

new Vue({
    // el: '#notebook',
    data: function () {
        return {
            content: `**Bold** *Italic* [Vue](https://vuejs.org)`,
        };
    },
    computed: {
        notePreview() {
            return parse(this.content);
        }
    }
}).$mount('#notebook');