/* global require module */

const m           = require("mithril");

const Credentials = require("credentials");
const Header      = require("header");
const Nav         = require("nav");
const Request     = require("request");

//========================================================================
const login = () => {
    Request.post("/sessions",
                 { user: { email: Credentials.email(), password: Credentials.password() } },
                 resp => {
                     Credentials.token(resp.data.token);
                     Credentials.name(resp.data.name);
                     Credentials.userId(resp.data.user_id);
                     Credentials.admin(resp.data.is_admin);
                     m.route.set("/scenarios");
                 });
};

//========================================================================
const LoginScreen = {
    view: (/*vnode*/) => {
        return [
            m(Header),
            m(Nav, { selected: "Login" }),
            m("div.main-content forgot-password",
              m("p.text",
                "Log in using your email and password. New user? ",
                m("a[href=/register]", { oncreate: m.route.link }, "Sign up!")
               ),
              m("p.text",
                m("table",
                  m("tr",
                    m("td", "Email"),
                    m("td",
                      m("input[type=email][name=email][size=40]", { onchange: m.withAttr("value", Credentials.email) }))),

                  m("tr",
                    m("td", "Password"),
                    m("td",
                      m("input[type=password][name=password][size=40]", { onchange: m.withAttr("value", Credentials.password) })),
                    m("td",
                      m("a.forgot-pw[href=/forgot-pw]", { oncreate: m.route.link }, "Forgot your password?"))),

                  m("tr",
                    m("td", ""),
                    m("button[value=Sign In][name=signin]", { onclick: () => login() }, "Sign In!"))
                 ))
             )
        ];
    }
};

module.exports = LoginScreen;
