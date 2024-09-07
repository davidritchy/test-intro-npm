import anime from "animejs/lib/anime.es.js";
import mustache from "mustache";
import animejs from "animejs/lib/anime.es.js";
import moment from "moment";
import page from "page";
import { log } from "three/webgpu";

export default class Application {
  constructor() {
    this.navigation = document.querySelector(".navigation");
    this.avancer = document.querySelector("#navigation_1");
    this.reculer = document.querySelector("#navigation_2");
    this.template = document.querySelector("template#abribus");
    this.essai = document.querySelector(".essai");
    this.source = document.querySelector(".source");
    this.nav = document.querySelector("nav");
    this.nav_li = this.nav.querySelector("li");
    this.nav_a = this.nav.querySelector("a");

    this.index = 0;
    this.base = "/test-intro-npm";

    // je cree les routes
    page(
      `${this.base}/source`,
      function () {
        this.afficherSource();
      }.bind(this)
    );

    page(
      `${this.base}`,
      function () {
        this.source.classList.add("invisible");
        this.afficherPage();
        this.nav_li.textContent = "Source";
        this.nav_a.href = `${this.base}/source`;
      }.bind(this)
    );

    //la navigation
    this.avancer.addEventListener("click", this.avancerPage.bind(this));
    this.reculer.addEventListener("click", this.reculerPage.bind(this));

    this.init();
  }

  async init() {
    await this.recupererDonnes();

    // j'affiche la page a l'index
    this.afficherPage(this.index);

    page.start();
  }

  async recupererDonnes() {
    this.requete = await fetch(
      "https://www.donneesquebec.ca/recherche/dataset/570ae2a1-3665-4196-9ee0-bb5417d5a08f/resource/e1f800f3-0357-4665-80cf-a0bf00dab740/download/offre-emploi.json"
    );

    this.reponse = await this.requete.json();
  }

  avancerPage() {
    this.index++;
    if (this.index >= 0) {
      this.afficherPage(this.index);
    }
  }

  reculerPage() {
    this.index--;
    if (this.index >= 0) {
      this.afficherPage(this.index);
    } else {
      console.log("desole la page est inferieur a 1");
    }
  }

  afficherPage(index) {
    let retrancher = 3;
    let modele = this.template.innerHTML;
    let clone = [...this.reponse];
    let tableau = clone.splice(index * 3, retrancher);

    // j'affiche les titres d'emploi
    this.essai.classList.remove("invisible");

    //Je formate la date
    for (let i = 0; i < this.reponse.length; i++) {
      let date_essai = moment(this.reponse[i].Date_debut_postuler);
      let date_autre_essai = moment(this.reponse[i].Date_limite_postuler);
      this.reponse[i].Date_debut_postuler =
        date_essai.format("dddd D MMMM YYYY");
      this.reponse[i].Date_limite_postuler =
        date_autre_essai.format("dddd D MMMM YYYY");
    }

    let data = { job: tableau };
    this.essai.innerHTML = mustache.render(modele, data);

    //je selectionne tous les boutons voir dans les emplois
    this.voir = this.essai.querySelectorAll("#voir");

    //fonction d'animation
    anime({
      targets: ".card",
      loop: false,
      translateY: [1500, 0],
      color: "#ff0000",
      easing: "easeInOutExpo",
      opacity: 50,
      delay: function (el, i, l) {
        return i * 1000;
      },
      endDelay: function (el, i, l) {
        return (l - i) * 1000;
      },
    });

    this.voir.forEach((element) => {
      // je mets un ecouteur sur chaque bouton
      element.addEventListener("click", this.afficherDetail.bind(this));
    });
  }

  afficherDetail(e) {
    this.voir_plus =
      e.target.parentElement.parentElement.querySelector("#voir_plus");
    this.cacher = e.target.parentElement.parentElement.querySelector(".cacher");

    this.voir_plus.classList.remove("invisible");
    this.cacher.classList.remove("invisible");

    this.cacher.addEventListener(
      "click",
      function (e) {
        if (e.target == e.target.closest("p")) {
          e.target.parentElement.parentElement.parentElement
            .querySelector("#voir_plus")
            .classList.add("invisible");
          this.cacher.classList.add("invisible");
        }
      }.bind(this)
    );
  }

  afficherSource() {
    this.nav_a.href = this.base;
    this.nav_li.textContent = "Back";
    this.essai.classList.add("invisible");
    this.source.classList.remove("invisible");
  }
}
