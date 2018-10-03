/* global require module */

const m      = require("mithril");

const Header = require("header");
const Nav    = require("nav");

//========================================================================
const AboutScreen = {
    view() {
        return [
            m(Header),
            m(Nav, { selected: "About" }),

            m("div.section-header text", "Welcome!"),
            m("p.text",
              "This web site lets you track your inventory of figures for Games Workshop's ",
              m("i", "Middle Earth Strategy Battle Game"),
              " and compare it against the requirements of the official published scenarios.",
              " Want to know the biggest (or smallest) scenarios?  Which scenarios have YouTube video replays?",
              " How many Warg Riders do you need if you want to play all of the scenarios?  How far along your collection is",
              " if you want to play ",
              m("i", "The Last Alliance"),
              "? You can find the answers here!"),

            m("p.text",
              "You'll need to sign up for an account to track your inventory.  This will also give you ability to rate ",
              "scenarios, to help your fellow gamers find an overlooked gem. When you sign up, the site will use a cookie to ",
              "remember who you are, but nothing other than that will be done with your information. Let's treat others as we ",
              "ourselves would like to be treated -- and I hate being spammed."),

            m("p.text",
              "If you note any incorrect information, find bugs, or have ideas for improvement, I'd love to hear from you at ",
              m("a[target=_new]", {href: "mailto:davetownsend.org"}, "dave@davetownsend.org"),
              "."),

            m("p.text",
              "Financial contributions are not required but are always appreciated.  (In a perfect world I would raise enough ",
              "money to work on this full-time. But the world ain't perfect.)  You can PayPal me a donation at the above email address."),

            m("p.text", "I hope you find this useful!"),

            m("p.text", "Dave Townsend")
        ];
    }
};

module.exports = AboutScreen;
