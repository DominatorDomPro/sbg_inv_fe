/* global m */

var m = require("mithril");

var API_URL = "http://127.0.0.1:4000/api";

var MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var BOOK_NAMES = {
    bpf:     "Battle of the Pelennor Fields",
    fotn:    "Fall of the Necromancer",
    fotr:    "The Fellowship of the Ring",
    fotr_jb: "The Fellowship of the Ring (Journey Book)",
    harad:   "Harad",
    kd:      "Khazad-dûm",
    roa:     "The Ruin of Arnor",
    rotk:    "The Return of the King",
    rotk_jb: "The Return of the King (Journey Book)",
    saf:     "Shadow & Flame",
    site:    "A Shadow in the East",
    sog:     "Siege of Gondor",
    sots:    "The Scouring of the Shire",
    ttt:     "The Two Towers",
    ttt_jb:  "The Two Towers (Journey Book)"
};

var FACTION_INFO = {
    angmar:        { name: "Angmar",        letter: "a" },
    dol_guldur:    { name: "Dol Guldur",    letter: "x" },
    dwarves:       { name: "Dwarves",       letter: "d" },
    easterlings:   { name: "Easterlings",   letter: "e" },
    fellowship:    { name: "Fellowship",    letter: "f" },
    free_peoples:  { name: "Free Peoples",  letter: "F" },
    gondor:        { name: "Gondor",        letter: "g" },
    harad:         { name: "Harad",         letter: "h" },
    isengard:      { name: "Isengard",      letter: "i" },
    lothlorien:    { name: "Lothlorien",    letter: "l" },
    mirkwood:      { name: "Mirkwood",      letter: "w" },
    moria:         { name: "Moria",         letter: "m" },
    mordor:        { name: "Mordor",        letter: "M" },
    rivendell:     { name: "Rivendell",     letter: "R" },
    rohan:         { name: "Rohan",         letter: "r" },
    white_council: { name: "White Council", letter: "w" }
};

function formatDate(age, year, month, day) {
    var a = [ ["", "FA", "SA", "TA"][age || 0] ];
    if (day > 0) {
        a.push(day);
    }
    if (month > 0) {
        a.push(MONTH_NAMES[month]);
    }
    a.push(year);
    return a.join(" ");
}

function cmp(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

// courtesy http://ratfactor.com/daves-guide-to-mithril-js
var requestWrapper = function(opts) {
    return new function() {
        var me = this;
        me.opts = opts;
        me.success = me.loading = me.failed = false;
        me.errorStatus = me.errorBody = "";
        me.data = null;
        me.opts.background = true;
        me.opts.extract = function(xhr) {
            if (xhr.status >= 300) {
                me.failed = true;
                me.success = me.loading = false;
                me.errorStatus = xhr.status;
                me.errorBody = xhr.responseText;
                m.redraw();
            }
            return xhr.responseText;
        };
        me.go = function() {
            me = me;
            me.loading = true;
            me.success = me.failed = false;
            m.request(me.opts).then(function(mydata) {
                me.success = true;
                me.failed = me.loading = false;
                me.data = mydata;
                m.redraw();
            });
        };
    };
};

var Pie = {
    view: function(ctrl, size, n, nPainted, nOwned) {
        var circleAttrs = { cx: size/2, cy: size/2, r: size/2-2, fill: '#ccc' };
        var pctPainted  = Math.min(n > 0 ? nPainted / n : 0, 1.0);
        var pctOwned    = Math.min(n > 0 ? nOwned   / n : 0, 1.0);

        // Use the most appropriate base circle color
        if (pctPainted == 1.0) {
            circleAttrs.fill = '#0a0';
        } else if (pctOwned == 1.0) {
            circleAttrs.fill = '#bb0';
        }

        return m("svg", { width: size, height: size }, [
            m("circle", circleAttrs),
            Pie.slice(circleAttrs, 0, pctPainted, "#0a0"),
            Pie.slice(circleAttrs, pctPainted, pctOwned, "#bb0")
        ]);
    },

    slice: function slice(circleAttrs, pctStart, pctEnd, fill) {
        // No slices at 0% or 100%
        if (pctStart >= pctEnd || (pctStart == 0.0 && pctEnd == 1.0)) {
            return null;
        }

        var pathParts = [];
        pathParts.push("M" + circleAttrs.cx + "," + circleAttrs.cy);
        pathParts.push("L" +
                       (circleAttrs.cx + (Math.sin(pctStart * 2 * Math.PI) * circleAttrs.r)) + "," +
                       (circleAttrs.cy - (Math.cos(pctStart * 2 * Math.PI) * circleAttrs.r)));
        pathParts.push("A" + circleAttrs.r + "," + circleAttrs.r);
        pathParts.push("0");  // x-axis rotate
        pathParts.push((pctEnd - pctStart >= .5 ? "1" : "0") + ",1"); // long-arc, clockwise
        pathParts.push((circleAttrs.cx + (Math.sin(pctEnd * 2 * Math.PI) * circleAttrs.r)) + "," +
                       (circleAttrs.cy - (Math.cos(pctEnd * 2 * Math.PI) * circleAttrs.r)));
        pathParts.push("z");

        return m("path", {
            d: pathParts.join(" "),
            style: "fill: " + fill + "; fill-opacity: 1; stroke: black; stroke-width: 1"
        });
    }
};

//==================================================================================================================================
var Header = {
    view: function(ctl) {
        return m(".page-header", [
            m(".title", "ME SBG Inventory")
        ]);
    }
};

//==================================================================================================================================
var Nav = {
    view: function(ctl, which) {
        var loginActive           = which == "Login";
        var inventoryActive       = which == "Inventory";
        var scenariosActive       = which == "Scenario List";
        var scenarioDetailsActive = which == "Scenario Details";

        return m("div.nav", [
            m("div.nav-header", [
                m("a[href=/login]", { config: m.route }, "Login/Register")
            ]),

            m("div.nav-header", [
                m("a",
                  { href: "/inventory", config: m.route, class: inventoryActive ? "nav-content-selected" : "nav-content-unselected" },
                  "Inventory"),
                m("br"),
            ]),

            m("div.nav-header", [
                m("a",
                  { href: "/scenarios", config: m.route, class: scenariosActive ? "nav-content-selected" : "nav-content-unselected" },
                  "Scenarios")
            ]),
            m("div.filter-group-header", ""),

            ScenarioListScreen.getSetFilters(null) > 1
                ? m("ul.filter-group", [ m("li", { onclick: () => ScenarioListScreen.unsetAllFilters() }, "Remove all") ])
                : null,

            m("select[name=source]", {
                onchange: function(ev) { ScenarioListScreen.setFilter("source", ev.target.value); }
              }, [
                  m("option[value=]", "... by Source"),
                  ScenarioListScreen.isFilterActive("source", "fotn")   ? null : m("option[value=fotn]", "Fall of the Necromancer"),
                  ScenarioListScreen.isFilterActive("source", "saf")    ? null : m("option[value=saf]", "Shadow and Flame"),
                  ScenarioListScreen.isFilterActive("source", "site")   ? null : m("option[value=site]", "A Shadow in the East"),
                  ScenarioListScreen.isFilterActive("source", "ttt_jb") ? null : m("option[value=ttt_jb]", "The Two Towers Journeybook")
            ]),
            m("ul.filter-group", ScenarioListScreen.getSetFilters("source").map((f) => {
                return f.state ? m("li", {
                                            onclick: (ev) =>
                                               ScenarioListScreen.unsetFilter("source", Object.keys(BOOK_NAMES).find((bk) => BOOK_NAMES[bk] == ev.target.textContent))
                                       },
                                       BOOK_NAMES[f.name])
                               : null;
            }))
        ]);
    }
};

//==================================================================================================================================
var MainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='/inventory']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

//==================================================================================================================================
var LoginScreen = function() {
    var errors = m.prop("");

    var register = () => {
        m.request({
            method: "POST",
            url: API_URL + "/sessions",
            data: { user: { email: LoginScreen.email(), password: LoginScreen.password() } }
        })
       .then((resp) => {
                 console.log(resp.data.token);
                 m.route("/scenarios");
             },
             errors);
    };

    var login = () => {
        m.request({
            method: "POST",
            url: API_URL + "/users",
            data: { user: { email: LoginScreen.email(), password: LoginScreen.password() } }
        })
        .then(register, errors);
    };

    var errorText = () => {
        var msgs = [];
        var errObj = errors().errors;
        for (var key in errObj) {
            msgs.push(key + ": " + errObj[key].join(", "));
        }
        return m.trust(msgs.join("<br/>"));
    };

    return {
        email: m.prop(),

        password: m.prop(),

        view(ctrl) {
            return [
                m(Header),
                m(Nav, "Login"),
                errors() ? m("div.errors", errorText()) : null,
                m("div.main-content", [
                    m("table", [
                        m("tr", [
                            m("td", "Username"),
                            m("td", [
                                m("input[type=text][name=username]", { onchange: m.withAttr("value", LoginScreen.email) })
                            ])
                        ]),
                        m("tr", [
                            m("td", "Password"),
                            m("td", [
                                m("input[type=password][name=password]", { onchange: m.withAttr("value", LoginScreen.password) })
                            ])
                        ]),
                        m("tr", [
                            m("td", ""),
                            m("button[value=Sign In][name=signin]", { onclick: () => login() }, "Sign In!")
                        ])
                    ])
                ])
            ];
        }
    };
}();

//==================================================================================================================================
var ScenarioListScreen = function() {
    var filters = {
        source: {
            data: [
                { name: "fotn",   state: false },
                { name: "saf",    state: false },
                { name: "site",   state: false },
                { name: "ttt_jb", state: false }
            ],

            evalFn(rec) {
                var activeFilters = filters.source.data.filter((f) => f.state);
                return activeFilters.length == 0 ? true : activeFilters.find((s) => s.name === rec.scenario_resources.source[0].book);  // TODO: non-book sources
            }
        }
    };

    return {
        data: m.prop(false),

        filter(rec) { return Object.keys(filters).reduce((acc, v) => filters[v].evalFn(rec) && acc, true); },

        getSetFilters(filterClass) {
            if (filterClass == null) {
                return Object.keys(filters).reduce((acc, v) => acc += ScenarioListScreen.getSetFilters(v).length, 0);
            }
            return filters[filterClass].data.filter((elt) => elt.state);
        },

        getUnsetFilters(filterClass) {
            return filters[filterClass].data.filter((elt) => !elt.state);
        },

        isFilterActive(filterClass, name) {
            return filters[filterClass].data.find((elt) => elt.name == name).state;
        },

        setFilter(filterClass, name) {
            var filter = filters[filterClass].data.find((elt) => elt.name == name);
            if (filter != null) {
                filter.state = true;
            }
        },

        unsetAllFilters() {
            for (var filterClass in filters) {
                filters[filterClass].data.forEach(f => f.state = false);
            }
        },

        unsetFilter(filterClass, name) {
            var filter = filters[filterClass].data.find((elt) => elt.name == name);
            if (filter != null) {
                filter.state = false;
            }
        },

        controller: function() {
            m.request({method: "GET", url: API_URL + "/scenarios"}).then(ScenarioListScreen.data).then(function() { m.redraw(); });
        },

        view: function(ctrl) {
            return [
                m(Header),
                m(Nav, "Scenario List"),
                m("div.main-content", [
                    ScenarioListScreen.data() ? ScenarioListScreen.drawTable(ScenarioListScreen.data().data) : "nope"
                ])
            ];
        },

        drawTable: function(rawData) {
            var rows = [
                m("tr", [
                    m("th.completion[data-sort-by=completion]", m.trust("Ready?<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.name[data-sort-by=name]", m.trust("Scenario<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.date[data-sort-by=date][colspan=2]", m.trust("Date<span class='sort-arrow'>&#9650;</span>")),
                    m("th.source[data-sort-by=source]", m.trust("Source<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.size[data-sort-by=size]", m.trust("Size<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.factions[colspan=2]", "Factions"),
                    m("th.resources", "Resources")
                ])];

            rawData.forEach(scenario => {
                var f1 = FACTION_INFO[scenario.scenario_factions[0].faction];
                var f2 = FACTION_INFO[scenario.scenario_factions[1].faction];
                if (ScenarioListScreen.filter(scenario)) {
                    rows.push(m("tr", [
                        m("td.completion", [m(Pie, 24, scenario.size, scenario.user_scenario.painted, scenario.user_scenario.owned)]),
                        m("td.name", [ m("a", { class: "scenario-detail-link", config: m.route, href: "/scenarios/" + scenario.id}, scenario.name) ]),
                        m("td.date-age", ScenarioListScreen.ageAbbrev(scenario.date_age)),
                        m("td.date-year", scenario.date_year),
                        m("td.source", scenario.scenario_resources["source"][0].title),
                        m("td.size", scenario.size),
                        m("td.faction faction1", {title: f1 && f1.name}, f1.letter),
                        m("td.faction faction2", {title: f2 && f2.name}, f2.letter),
                        m("td.resources", ScenarioListScreen.resourceIcons(scenario.scenario_resources))
                    ]));
                }
            });


            return m("table.scenario-list", ScenarioListScreen.tableSorter(rawData), rows);
        },

        ageAbbrev: function(ageNumber) {
            if (1 <= ageNumber && ageNumber <= 3) {
                return ["?", "FA", "SA", "TA"][ageNumber];
            }
            return "??";
        },

        resourceIcons: function(resources) {
            var r = [];
            if (resources.web_replay != null && resources.web_replay.length > 0) {
                r.push(m("span", "W"));
            }
            if (resources.video_replay != null && resources.video_replay.length > 0) {
                r.push(m("span", "V"));
            }
            if (resources.podcast != null && resources.podcast.length > 0) {
                r.push(m("span", "P"));
            }
            return r;
        },

        tableSorter: function(list) {
            return {
                onclick: function(ev) {
                    var prop = ev.target.getAttribute("data-sort-by");
                    if (prop) {
                        var sorters = {
                            completion: function(a, b) {
                                var d = cmp(a.user_scenario.painted / a.size, b.user_scenario.painted / b.size);
                                if (d == 0) {
                                    d = cmp(a.user_scenario.owned / a.size, b.user_scenario.owned / b.size);
                                }
                                if (d == 0) {
                                    d = cmp(b.size, a.size);
                                    if (d == 0) {
                                        d = cmp(a.name, b.name);
                                    }
                                }
                                return d;
                            },

                            name: function(a, b) {
                                return cmp(a[prop], b[prop]);
                            },

                            date: function(a, b) { // TODO: handle dates of same year with month,day = (0,0) & non-TA dates
                                return cmp(a.date_year, b.date_year) ||
                                    cmp(a.date_month, b.date_month) ||
                                    cmp(a.date_day, b.date_day);
                            },

                            size: function(a, b) {
                                return cmp(a[prop], b[prop]);  // TODO: tiebreaker
                            },

                            source: function(a, b) {
                                var a_src = a.scenario_resources["source"][0];
                                var b_src = b.scenario_resources["source"][0];
                                return cmp(a_src.title, b_src.title) ||
                                    cmp(a_src.sort_order, b_src.sort_order);
                            }
                        };

                        var arrowNodes = document.getElementsByClassName("sort-arrow");
                        for (var i = 0; i < arrowNodes.length; ++i) {
                            arrowNodes[i].innerHTML = "&nbsp;";
                        }

                        var arrowChar = "&#9650;";   // ^
                        var firstId = list[0].id;
                        list.sort(sorters[prop]);
                        if (firstId === list[0].id) {
                            list.reverse();
                            arrowChar = "&#9660;";   // v
                        }
                        ev.target.getElementsByClassName("sort-arrow")[0].innerHTML = arrowChar;
                    }
                }
            };
        }
    };
}();

//==================================================================================================================================
var ScenarioDetailScreen = {
    data: m.prop(false),

    controller: function() {
        m.request({
            method: "GET",
            url: API_URL + "/scenarios/" + m.route.param("id")
        }).then(ScenarioDetailScreen.data)
          .then(function() { m.redraw(); });
    },

    view: function(ctrl) {
        var scenario = ScenarioDetailScreen.data().data;

        return [
            m(Header),
            m(Nav, "Scenario Details"),
            m("div.main-content", [
                m("div.scenario-details", [
                    m("div.scenario-title", scenario.name),
                    m("div.scenario-date", formatDate(scenario.date_age, scenario.date_year, scenario.date_month, scenario.date_day)),
                    m("div.scenario-blurb", scenario.blurb),
                    m("div.scenario-factions", ScenarioDetailScreen.factionsRollup(scenario)),
                    m("div.scenario-resources", ScenarioDetailScreen.resourcesRollup(scenario))
                ])
            ])
        ];
    },

    factionsRollup: function(scenario) {
        if (!scenario.scenario_factions) {
            return null;
        }

        var f = [ m("div.scenario-details-section-title", "Participants") ];
        scenario.scenario_factions.forEach(function(faction) {
            f.push(ScenarioDetailScreen.factionRollup(faction));
        });
        return m("div.factions-container", f);
    },

    factionRollup: function(faction) {
        return m("div.faction", [
            m("div.faction-name", FACTION_INFO[faction.faction].name)
        ].concat(ScenarioDetailScreen.rolesRollup(faction.roles)));
    },

    rolesRollup: function(rolesList) {
        var roles = [];
        if (rolesList != null) {
            rolesList.forEach(function(r) {
                roles.push(m("div.role-line", [
                    m(Pie, 24, r.amount, r.num_painted, r.num_owned),
                    r.amount > 1 ? m("div.role-line-amount", r.amount) : null,
                    m("div.role-line-name", r.name)
                ].concat(ScenarioDetailScreen.figuresRollup(r.figures))));
            });
        }
        return roles;
    },

    figuresRollup: function(figuresList) {
        var figures = [];
        if (figuresList.length > 1) {
            figuresList.forEach(function(f) {
                figures.push(m("div.figure-line", [
                    m(Pie, 24, f.owned, f.painted, f.owned),
                    f.owned > 1 ? m("div.figure-line-amount", f.owned) : null,
                    m("div.figure-line-name", f.name)
                ]));
            });
        }
        return figures;
    },

    resourcesRollup: function(scenario) {
        if (!scenario.scenario_resources) {
            return null;
        }

        var r = [ m("div.scenario-details-section-title", "Resources") ];
        ScenarioDetailScreen.resourcesRollupAddSource(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddVideoReplays(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddWebReplays(r, scenario.scenario_resources);
        return m("div.scenario-resources", r);
    },

    resourcesRollupAddSource: function(eltArray, resources) {
        if (resources.source) {
            resources.source.forEach(function(resource) {
                eltArray.push(m("div.scenario-source", [
                    m("span.scenario-source-title", "Source: "),
                    m("span.scenario-source-book-title", BOOK_NAMES[resource.book]),
                    m("span.scenario-source-book-page", ", page " + resource.page)
                ]));
            });
        }
    },

    resourcesRollupAddVideoReplays: function(eltArray, resources) {
        if (resources.video_replay) {
            resources.video_replay.forEach(function(resource) {
                eltArray.push(m("div.video-replay", [
                    m("span.scenario-video-replay-title", "Video Replay: "),
                    m("span.scenario-video-replay-url", [
                        m("a", { href: resource.url }, resource.title || resource.url)
                    ])
                ]));
            });
        }
    },

    resourcesRollupAddWebReplays: function(eltArray, resources) {
        if (resources.web_replay) {
            resources.web_replay.forEach(function(resource) {
                eltArray.push(m("div.web-replay", [
                    m("span.scenario-web-replay-title", "Web Replay: "),
                    m("span.scenario-web-replay-url", [
                        m("a", { href: resource.url }, resource.title || resource.url)
                    ])
                ]));
            });
        }
    }
};

//==================================================================================================================================
var InventoryScreen = {
    view: function() {
        return [
            m(Header),
            m(Nav, "Inventory"),
            m("div.main-content", "*** Inventory ***")
        ];
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/": MainScreen,
    "/scenarios/:id": ScenarioDetailScreen,
    "/scenarios": ScenarioListScreen,
    "/inventory": InventoryScreen,
    "/login": LoginScreen
});
