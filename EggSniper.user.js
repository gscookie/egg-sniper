// ==UserScript==
// @name         EggSniper
// @namespace    EggSniper
// @version      0.3
// @description  Detects and simplifies egging immimnent eggs
// @author       gscookie
// @match        https://www.twitch.tv/mrsruvi*
// @updateURL    https://github.com/gscookie/egg-sniper/raw/master/EggSniper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const config = { attributes: false, childList: true, subtree: false };

    var new_egg_list = [];

    function createStatusMessage(message) {
        var template = document.createElement('template');
        let html = `<div class="ffz-notice-line user-notice-line tw-pd-y-05 tw-pd-r-2 ffz--subscribe-line"><div class="tw-flex tw-c-text-alt-2"><figure class="ffz-i-star tw-mg-r-05"></figure><div>${message}</div></div></div>`
        template.innerHTML = html;
        return template.content.firstChild;
    }

    function createSubSniper(room, user) {
        var template = document.createElement('template');
        let sub_url = `https://www.twitch.tv/products/${room}?recipient=${user}`;
        let html = `<div class="ffz-notice-line user-notice-line tw-pd-y-05 tw-pd-r-2 ffz--subscribe-line" data-room="${room}" data-user="${user}"><div class="tw-flex tw-c-text-alt-2"><figure class="ffz-i-star tw-mg-r-05"></figure><div><span role="button" class="chatter-name"><span class="tw-c-text-base tw-strong">${user}</span></span> detected without an egg! <a target="_blank" href="${sub_url}">Egg them!</a></div></div></div>`
        template.innerHTML = html;
        return template.content.firstChild;
    }

    // Callback function to execute when mutations are observed
    const chatCallback = function(mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for(let newNode of mutation.addedNodes) {
                    let badges = newNode.getElementsByClassName('chat-line__message--badges');
                    if(badges.length == 0) {return;}

                    let isSubbed = [...badges[0].children].map(e => e.dataset.badge).filter(e => ['subscriber', 'founder'].includes(e)).length > 0
                    if(!isSubbed && !new_egg_list.includes(`${newNode.dataset.room}!${newNode.dataset.user}`)) {
                        new_egg_list.push(`${newNode.dataset.room}!${newNode.dataset.user}`);
                        console.log(`Unsubscribed user found! <${newNode.dataset.user}>`);
                        newNode.parentNode.appendChild(createSubSniper(newNode.dataset.room, newNode.dataset.user));
                    }
                }
            }
        }
    };

    var installer = window.setInterval(function(){
        // Select the node that will be observed for mutations
        const chatbox = document.getElementsByClassName('chat-scrollable-area__message-container')[0]

        // Skip if chatbox doesn't exist.
        if(chatbox == undefined) { return; }

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(chatCallback);

        // Start observing the target node for configured mutations
        observer.observe(chatbox, config);

        chatbox.appendChild(createStatusMessage('Egg sniper loaded!'));
        window.clearInterval(installer);

    }, 5000);
})();