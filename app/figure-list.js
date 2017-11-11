/* global require module */

var FigureListScreen = {};
module.exports = FigureListScreen;

var m           = require("mithril");
var Credentials = require("credentials");
var K           = require("constants");
var Request     = require("request");

var armyId = "";
var figuresMap = {};

//========================================================================
function domArmyDetails() {
    if (armyId == "") {
        return null;
    }

    return [
        m("table",
          armyId
            ? m("tr.table-header",
                m("td", ""),
                m("td.needed", "Needed"),
                Credentials.isLoggedIn() ? m("td.owned", "Owned") : null,
                Credentials.isLoggedIn() ? m("td.painted", "Painted") : null)
            : null,
          domFigureListByType("Characters", figuresMap.heroes.filter(fig => fig.unique)),
          domFigureListByType("Heroes", figuresMap.heroes.filter(fig => !fig.unique)),
          domFigureListByType("Warriors", figuresMap.warriors),
          domFigureListByType("Monsters", figuresMap.monsters),
          domFigureListByType("Siege Equipment", figuresMap.siegers))
    ];
};

//========================================================================
function domFigureListByType(title, list) {
    if (list.length === 0) {
        return null;
    }

    return [
        m("tr.figure-list-section", m("td.section-header", title)),
        list.map(fig => {
            return m("tr",
                     m("td.name", m("a", { href: "/figures/" + fig.id, oncreate: m.route.link }, fig["name"])),
                     m("td.needed", fig.needed),
                     Credentials.isLoggedIn() ? m("td.owned", fig.owned) : null,
                     Credentials.isLoggedIn() ? m("td.painted", fig.painted) : null
                    );
        })
    ];
};

//========================================================================
FigureListScreen.updateArmyDetails = (ev) => {
    armyId = ev.target.value;
    figuresMap = {
        characters: [],
        heroes: [],
        warriors: [],
        monsters: [],
        siegers: []
    };
    Request.get("/faction/" + armyId,
                resp => {
                    figuresMap = resp.data;
                });
}

//========================================================================
FigureListScreen.view = () => {
    return [
        m(require("header")),
        m(require("nav"), { selected: "Figures" }),
        m("div.main-content figure-list-main-content", [
            m("select.faction", { onchange: ev => FigureListScreen.updateArmyDetails(ev) }, [
                  m("option", { value: "" }, "-- Select an Army --"),
                  Object.keys(K.FACTION_INFO).map((k, i) => m("option", { value: i, selected: i == armyId }, K.FACTION_INFO[k].name)),
                  m("option", { value: "-1" }, "Unaffiliated")
            ]),
            domArmyDetails()])
    ];
};
