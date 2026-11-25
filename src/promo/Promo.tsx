// @ts-nocheck
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React from "react";
import { promoSalesCopy, promoFooterGroups } from "./site-footer";
import { claudePromoAssets as ASSETS } from "./content";
// Original owner-supplied Extremis artwork; embedded unchanged for a durable preview asset.
const EXTREMIS_LOGO_SRC =
  "/evolution-promo/assets/original-27.jpg";
const EXTREMIS_DASHBOARD_SRC =
  "/evolution-promo/assets/original-28.png";
const EXTREMIS_CIRCUIT_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%3E%3Cdefs%3E%3Cfilter%20id%3D%22g%22%20x%3D%22-20%25%22%20y%3D%22-20%25%22%20width%3D%22140%25%22%20height%3D%22140%25%22%3E%3CfeGaussianBlur%20stdDeviation%3D%221.2%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23631820%22%20stroke-width%3D%221%22%20opacity%3D%22.85%22%3E%3Cpath%20d%3D%22M20%2C0%20L20%2C70%20L45%2C95%20L45%2C184%20L265%2C270%22%2F%3E%3Cpath%20d%3D%22M0%2C52%20L40%2C52%20L65%2C77%20L126%2C77%22%2F%3E%3Cpath%20d%3D%22M20%2C600%20L20%2C520%20L52%2C488%20L52%2C430%20L270%2C340%22%2F%3E%3Cpath%20d%3D%22M47%2C0%20L47%2C81%20L72%2C106%20L72%2C194%20L265%2C274%22%2F%3E%3Cpath%20d%3D%22M0%2C100%20L53%2C100%20L78%2C125%20L134%2C125%22%2F%3E%3Cpath%20d%3D%22M47%2C600%20L47%2C512%20L79%2C480%20L79%2C421%20L270%2C337%22%2F%3E%3Cpath%20d%3D%22M74%2C0%20L74%2C92%20L99%2C117%20L99%2C204%20L265%2C278%22%2F%3E%3Cpath%20d%3D%22M0%2C148%20L66%2C148%20L91%2C173%20L142%2C173%22%2F%3E%3Cpath%20d%3D%22M74%2C600%20L74%2C504%20L106%2C472%20L106%2C412%20L270%2C334%22%2F%3E%3Cpath%20d%3D%22M101%2C0%20L101%2C103%20L126%2C128%20L126%2C214%20L265%2C282%22%2F%3E%3Cpath%20d%3D%22M0%2C196%20L79%2C196%20L104%2C221%20L150%2C221%22%2F%3E%3Cpath%20d%3D%22M101%2C600%20L101%2C496%20L133%2C464%20L133%2C403%20L270%2C331%22%2F%3E%3Cpath%20d%3D%22M128%2C0%20L128%2C114%20L153%2C139%20L153%2C224%20L265%2C286%22%2F%3E%3Cpath%20d%3D%22M0%2C244%20L92%2C244%20L117%2C269%20L158%2C269%22%2F%3E%3Cpath%20d%3D%22M128%2C600%20L128%2C488%20L160%2C456%20L160%2C394%20L270%2C328%22%2F%3E%3Cpath%20d%3D%22M155%2C0%20L155%2C125%20L180%2C150%20L180%2C234%20L265%2C290%22%2F%3E%3Cpath%20d%3D%22M0%2C292%20L105%2C292%20L130%2C317%20L166%2C317%22%2F%3E%3Cpath%20d%3D%22M155%2C600%20L155%2C480%20L187%2C448%20L187%2C385%20L270%2C325%22%2F%3E%3Cpath%20d%3D%22M182%2C0%20L182%2C136%20L207%2C161%20L207%2C244%20L265%2C294%22%2F%3E%3Cpath%20d%3D%22M0%2C340%20L118%2C340%20L143%2C365%20L174%2C365%22%2F%3E%3Cpath%20d%3D%22M182%2C600%20L182%2C472%20L214%2C440%20L214%2C376%20L270%2C322%22%2F%3E%3Cpath%20d%3D%22M209%2C0%20L209%2C147%20L234%2C172%20L234%2C254%20L265%2C298%22%2F%3E%3Cpath%20d%3D%22M0%2C388%20L131%2C388%20L156%2C413%20L182%2C413%22%2F%3E%3Cpath%20d%3D%22M209%2C600%20L209%2C464%20L241%2C432%20L241%2C367%20L270%2C319%22%2F%3E%3Cpath%20d%3D%22M236%2C0%20L236%2C158%20L261%2C183%20L261%2C264%20L265%2C302%22%2F%3E%3Cpath%20d%3D%22M0%2C436%20L144%2C436%20L169%2C461%20L190%2C461%22%2F%3E%3Cpath%20d%3D%22M236%2C600%20L236%2C456%20L268%2C424%20L268%2C358%20L270%2C316%22%2F%3E%3Cpath%20d%3D%22M580%2C0%20L580%2C70%20L555%2C95%20L555%2C184%20L335%2C270%22%2F%3E%3Cpath%20d%3D%22M600%2C52%20L560%2C52%20L535%2C77%20L474%2C77%22%2F%3E%3Cpath%20d%3D%22M580%2C600%20L580%2C520%20L548%2C488%20L548%2C430%20L330%2C340%22%2F%3E%3Cpath%20d%3D%22M553%2C0%20L553%2C81%20L528%2C106%20L528%2C194%20L335%2C274%22%2F%3E%3Cpath%20d%3D%22M600%2C100%20L547%2C100%20L522%2C125%20L466%2C125%22%2F%3E%3Cpath%20d%3D%22M553%2C600%20L553%2C512%20L521%2C480%20L521%2C421%20L330%2C337%22%2F%3E%3Cpath%20d%3D%22M526%2C0%20L526%2C92%20L501%2C117%20L501%2C204%20L335%2C278%22%2F%3E%3Cpath%20d%3D%22M600%2C148%20L534%2C148%20L509%2C173%20L458%2C173%22%2F%3E%3Cpath%20d%3D%22M526%2C600%20L526%2C504%20L494%2C472%20L494%2C412%20L330%2C334%22%2F%3E%3Cpath%20d%3D%22M499%2C0%20L499%2C103%20L474%2C128%20L474%2C214%20L335%2C282%22%2F%3E%3Cpath%20d%3D%22M600%2C196%20L521%2C196%20L496%2C221%20L450%2C221%22%2F%3E%3Cpath%20d%3D%22M499%2C600%20L499%2C496%20L467%2C464%20L467%2C403%20L330%2C331%22%2F%3E%3Cpath%20d%3D%22M472%2C0%20L472%2C114%20L447%2C139%20L447%2C224%20L335%2C286%22%2F%3E%3Cpath%20d%3D%22M600%2C244%20L508%2C244%20L483%2C269%20L442%2C269%22%2F%3E%3Cpath%20d%3D%22M472%2C600%20L472%2C488%20L440%2C456%20L440%2C394%20L330%2C328%22%2F%3E%3Cpath%20d%3D%22M445%2C0%20L445%2C125%20L420%2C150%20L420%2C234%20L335%2C290%22%2F%3E%3Cpath%20d%3D%22M600%2C292%20L495%2C292%20L470%2C317%20L434%2C317%22%2F%3E%3Cpath%20d%3D%22M445%2C600%20L445%2C480%20L413%2C448%20L413%2C385%20L330%2C325%22%2F%3E%3Cpath%20d%3D%22M418%2C0%20L418%2C136%20L393%2C161%20L393%2C244%20L335%2C294%22%2F%3E%3Cpath%20d%3D%22M600%2C340%20L482%2C340%20L457%2C365%20L426%2C365%22%2F%3E%3Cpath%20d%3D%22M418%2C600%20L418%2C472%20L386%2C440%20L386%2C376%20L330%2C322%22%2F%3E%3Cpath%20d%3D%22M391%2C0%20L391%2C147%20L366%2C172%20L366%2C254%20L335%2C298%22%2F%3E%3Cpath%20d%3D%22M600%2C388%20L469%2C388%20L444%2C413%20L418%2C413%22%2F%3E%3Cpath%20d%3D%22M391%2C600%20L391%2C464%20L359%2C432%20L359%2C367%20L330%2C319%22%2F%3E%3Cpath%20d%3D%22M364%2C0%20L364%2C158%20L339%2C183%20L339%2C264%20L335%2C302%22%2F%3E%3Cpath%20d%3D%22M600%2C436%20L456%2C436%20L431%2C461%20L410%2C461%22%2F%3E%3Cpath%20d%3D%22M364%2C600%20L364%2C456%20L332%2C424%20L332%2C358%20L330%2C316%22%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ee2638%22%20stroke-width%3D%222%22%20opacity%3D%22.4%22%20filter%3D%22url%28%23g%29%22%3E%3Cpath%20d%3D%22M20%2C0%20L20%2C70%20L45%2C95%20L45%2C184%20L265%2C270%22%2F%3E%3Cpath%20d%3D%22M47%2C600%20L47%2C512%20L79%2C480%20L79%2C421%20L270%2C337%22%2F%3E%3Cpath%20d%3D%22M0%2C196%20L79%2C196%20L104%2C221%20L150%2C221%22%2F%3E%3Cpath%20d%3D%22M155%2C0%20L155%2C125%20L180%2C150%20L180%2C234%20L265%2C290%22%2F%3E%3Cpath%20d%3D%22M182%2C600%20L182%2C472%20L214%2C440%20L214%2C376%20L270%2C322%22%2F%3E%3Cpath%20d%3D%22M0%2C436%20L144%2C436%20L169%2C461%20L190%2C461%22%2F%3E%3Cpath%20d%3D%22M553%2C0%20L553%2C81%20L528%2C106%20L528%2C194%20L335%2C274%22%2F%3E%3Cpath%20d%3D%22M526%2C600%20L526%2C504%20L494%2C472%20L494%2C412%20L330%2C334%22%2F%3E%3Cpath%20d%3D%22M600%2C244%20L508%2C244%20L483%2C269%20L442%2C269%22%2F%3E%3Cpath%20d%3D%22M418%2C0%20L418%2C136%20L393%2C161%20L393%2C244%20L335%2C294%22%2F%3E%3Cpath%20d%3D%22M391%2C600%20L391%2C464%20L359%2C432%20L359%2C367%20L330%2C319%22%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23bc2030%22%20stroke-width%3D%22.8%22%20opacity%3D%22.8%22%3E%3Cpath%20d%3D%22M20%2C0%20L20%2C70%20L45%2C95%20L45%2C184%20L265%2C270%22%2F%3E%3Cpath%20d%3D%22M47%2C600%20L47%2C512%20L79%2C480%20L79%2C421%20L270%2C337%22%2F%3E%3Cpath%20d%3D%22M0%2C196%20L79%2C196%20L104%2C221%20L150%2C221%22%2F%3E%3Cpath%20d%3D%22M155%2C0%20L155%2C125%20L180%2C150%20L180%2C234%20L265%2C290%22%2F%3E%3Cpath%20d%3D%22M182%2C600%20L182%2C472%20L214%2C440%20L214%2C376%20L270%2C322%22%2F%3E%3Cpath%20d%3D%22M0%2C436%20L144%2C436%20L169%2C461%20L190%2C461%22%2F%3E%3Cpath%20d%3D%22M553%2C0%20L553%2C81%20L528%2C106%20L528%2C194%20L335%2C274%22%2F%3E%3Cpath%20d%3D%22M526%2C600%20L526%2C504%20L494%2C472%20L494%2C412%20L330%2C334%22%2F%3E%3Cpath%20d%3D%22M600%2C244%20L508%2C244%20L483%2C269%20L442%2C269%22%2F%3E%3Cpath%20d%3D%22M418%2C0%20L418%2C136%20L393%2C161%20L393%2C244%20L335%2C294%22%2F%3E%3Cpath%20d%3D%22M391%2C600%20L391%2C464%20L359%2C432%20L359%2C367%20L330%2C319%22%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%22%23ad2230%22%20opacity%3D%22.8%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2270%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2245%22%20cy%3D%22184%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2252%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2252%22%20cy%3D%22488%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2281%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2272%22%20cy%3D%22194%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2253%22%20cy%3D%22100%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2279%22%20cy%3D%22480%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2274%22%20cy%3D%2292%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2299%22%20cy%3D%22204%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2266%22%20cy%3D%22148%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22106%22%20cy%3D%22472%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22101%22%20cy%3D%22103%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22126%22%20cy%3D%22214%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2279%22%20cy%3D%22196%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22133%22%20cy%3D%22464%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22128%22%20cy%3D%22114%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22153%22%20cy%3D%22224%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2292%22%20cy%3D%22244%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22456%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%22125%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22180%22%20cy%3D%22234%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22105%22%20cy%3D%22292%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22187%22%20cy%3D%22448%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22182%22%20cy%3D%22136%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22207%22%20cy%3D%22244%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22118%22%20cy%3D%22340%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22214%22%20cy%3D%22440%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22209%22%20cy%3D%22147%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22234%22%20cy%3D%22254%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22131%22%20cy%3D%22388%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22241%22%20cy%3D%22432%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22236%22%20cy%3D%22158%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22261%22%20cy%3D%22264%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22144%22%20cy%3D%22436%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22268%22%20cy%3D%22424%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22580%22%20cy%3D%2270%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22555%22%20cy%3D%22184%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22560%22%20cy%3D%2252%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22548%22%20cy%3D%22488%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22553%22%20cy%3D%2281%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22528%22%20cy%3D%22194%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22547%22%20cy%3D%22100%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22521%22%20cy%3D%22480%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22526%22%20cy%3D%2292%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22501%22%20cy%3D%22204%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22534%22%20cy%3D%22148%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22494%22%20cy%3D%22472%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22499%22%20cy%3D%22103%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22474%22%20cy%3D%22214%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22521%22%20cy%3D%22196%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22467%22%20cy%3D%22464%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22472%22%20cy%3D%22114%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22447%22%20cy%3D%22224%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22508%22%20cy%3D%22244%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22440%22%20cy%3D%22456%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22445%22%20cy%3D%22125%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22420%22%20cy%3D%22234%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22495%22%20cy%3D%22292%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22413%22%20cy%3D%22448%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22418%22%20cy%3D%22136%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22393%22%20cy%3D%22244%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22482%22%20cy%3D%22340%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22386%22%20cy%3D%22440%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22391%22%20cy%3D%22147%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22366%22%20cy%3D%22254%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22469%22%20cy%3D%22388%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22359%22%20cy%3D%22432%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22364%22%20cy%3D%22158%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22339%22%20cy%3D%22264%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22456%22%20cy%3D%22436%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%22332%22%20cy%3D%22424%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%2391202b%22%20stroke-width%3D%221%22%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22576%22%20height%3D%22576%22%2F%3E%3Cpath%20d%3D%22M24%2042V24H110M490%2024H576V42M24%20558V576H110M490%20576H576V558%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
function ExtremisPromoLogo({ style = {}, alt }) {
  return jsx("span", {
    style: {
      display: "block",
      aspectRatio: "16 / 9",
      isolation: "isolate",
      overflow: "hidden",
      ...style,
      background: `#050203 url("${EXTREMIS_CIRCUIT_SRC}") center/cover no-repeat`,
    },
    children: jsx("img", {
      src: EXTREMIS_LOGO_SRC,
      alt,
      width: 1536,
      height: 864,
      style: {
        display: "block",
        width: "84%",
        height: "84%",
        margin: "4.5% auto",
        objectFit: "contain",
        filter: "none",
      },
    }),
  });
}
const asset = (name) => ASSETS[name] || name;
const resolveAssets = (value) =>
  typeof value === "string"
    ? value.replace(/(?:assets|uploads|public\/showcase)\/[^\s\)"'<>]+/g, (name) => ASSETS[name] || name)
    : value;
const EvolutionPage = (() => {
  const ICONS = {
    crosshair: [
      ["circle", { cx: 12, cy: 12, r: 10 }],
      ["line", { x1: 22, y1: 12, x2: 18, y2: 12 }],
      ["line", { x1: 6, y1: 12, x2: 2, y2: 12 }],
      ["line", { x1: 12, y1: 6, x2: 12, y2: 2 }],
      ["line", { x1: 12, y1: 22, x2: 12, y2: 18 }],
    ],
    barChart: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"],
    trendingUp: [
      ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17" }],
      ["polyline", { points: "16 7 22 7 22 13" }],
    ],
    user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", ["circle", { cx: 12, cy: 7, r: 4 }]],
    grid: [
      ["rect", { x: 3, y: 3, width: 7, height: 7, rx: 1 }],
      ["rect", { x: 14, y: 3, width: 7, height: 7, rx: 1 }],
      ["rect", { x: 14, y: 14, width: 7, height: 7, rx: 1 }],
      ["rect", { x: 3, y: 14, width: 7, height: 7, rx: 1 }],
    ],
    book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
    note: ["M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z", "M15 3v6h6"],
    scan: [
      "M3 7V5a2 2 0 0 1 2-2h2",
      "M17 3h2a2 2 0 0 1 2 2v2",
      "M21 17v2a2 2 0 0 1-2 2h-2",
      "M7 21H5a2 2 0 0 1-2-2v-2",
      "M7 12h10",
    ],
    utensils: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", "M7 2v20", "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"],
    dumbbell: ["m6.5 6.5 11 11", "m21 21-1-1", "m3 3 1 1", "m18 22 4-4", "m2 6 4-4", "m3 10 7-7", "m14 21 7-7"],
    lineChart: ["M3 3v18h18", "m19 9-5 5-4-4-3 3"],
    briefcase: ["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", ["rect", { x: 2, y: 6, width: 20, height: 14, rx: 2 }]],
  };
  const icon = (name, size, sw) =>
    React.createElement(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: sw,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
      },
      ICONS[name].map((d, i) =>
        typeof d === "string"
          ? React.createElement("path", { key: i, d })
          : React.createElement(d[0], { key: i, ...d[1] }),
      ),
    );
  const MSHOTS = [
    {
      title: "Home",
      src: "assets/mobile-home.jpeg",
      w: 1290,
      h: 2573,
      alt: "Evolution OS mobile Home screen with sample content: seven system icons for Nutrition, Fitness, Wealth, Investing, Journal, Business and Focus around a bonsai hub, a Focus timer set to 25:00 Deep Work, and Home, Stats, Tasks and Profile navigation",
    },
    {
      title: "Tasks & Habits",
      src: "assets/mobile-tasks.png",
      w: 834,
      h: 1663,
      alt: "Evolution OS mobile Tasks screen with sample content: a weekly check-in row, daily habits at 5 of 8 complete, a list of today\u2019s tasks including Morning Meditation and Workout - Push Day, and quick actions",
    },
    {
      title: "Stats",
      src: "assets/mobile-stats.png",
      w: 1161,
      h: 2316,
      alt: "Evolution OS mobile Stats overview with sample content: overall score 87 percent, tasks completed, focus time, habit consistency and current streak cards, a seven-day productivity trend, time breakdown, task completion and top areas",
    },
    {
      title: "Business / Projects",
      src: "assets/mobile-business.png",
      w: 1290,
      h: 2796,
      alt: "Evolution OS mobile Business Projects screen with sample content: five projects with progress bars and target dates, quick actions, today\u2019s focus, business metrics and project health",
    },
  ];
  const NAV = [
    ["features", "Philosophy"],
    ["system", "The system"],
    ["workflow", "Deep work"],
    ["access", "Access"],
    ["faq", "FAQ"],
  ];
  const PILLARS = [
    ["crosshair", "Focus your mind", "Make room for intentional work."],
    ["barChart", "Track & review", "See the areas that matter to you."],
    ["trendingUp", "Build daily", "Connect today\u2019s actions to your goals."],
  ];
  const VALUES = [
    ["user", "High performers", "For people who approach their work, training, and personal growth with intention."],
    ["grid", "All-in-one system", "Seven areas of life, brought into one considered interface."],
    [
      "crosshair",
      "Personal perspective",
      "A view of your own goals, ideas, and effort. Not someone else's definition of progress.",
    ],
    ["book", "Designed to evolve", "A place for the plans you make today and the direction you choose next."],
  ];
  const FLOW = [
    ["note", "01", "Capture", "Capture ideas, plans, and insights in Notes. Give your thoughts a place to land."],
    [
      "crosshair",
      "02",
      "Focus",
      "Enter deep focus when it\u2019s time to execute. Focus Mode brings a timer, sessions, and round counter into the dashboard.",
    ],
    [
      "scan",
      "03",
      "Review",
      "Review the results in the relevant module. Reflect on what\u2019s moving you closer to your goals.",
    ],
  ];
  const MODULES = [
    {
      name: "Wealth",
      icon: "trendingUp",
      description: "Net worth, assets, and financial goals.",
      detail: "A dedicated place to bring your financial picture into focus.",
      topics: ["Net worth", "Assets", "Financial goals"],
      prompt: "What are you building toward?",
      image: "public/showcase/wealth-demo.png",
      imageAlt: "Evolution OS Wealth dashboard with net worth, asset allocation, and recent transactions",
    },
    {
      name: "Nutrition",
      icon: "utensils",
      description: "Daily calories, macros, and meal tracking with midnight reset.",
      detail: "Keep the day's nutrition in one view, with a fresh start at midnight.",
      topics: ["Daily calories", "Macros", "Meals"],
      prompt: "What does today look like?",
      image: "assets/mobile-home.jpeg",
      imageAlt: "Evolution OS daily mobile dashboard showing the seven life systems",
    },
    {
      name: "Fitness",
      icon: "dumbbell",
      description: "Workouts, PRs, and weekly sessions.",
      detail: "Bring your training sessions and personal records into the same picture.",
      topics: ["Workouts", "Personal records", "Weekly sessions"],
      prompt: "What are you working on?",
      image: "assets/mobile-stats.png",
      imageAlt: "Evolution OS mobile statistics dashboard showing activity and progress",
    },
    {
      name: "Journal",
      icon: "book",
      description: "Daily reflection and mindset entries.",
      detail: "Make room to reflect on the day, not just move through it.",
      topics: ["Daily reflection", "Mindset entries"],
      prompt: "What is worth remembering?",
      image: "public/showcase/journal-demo.png",
      imageAlt: "Evolution OS Journal dashboard with reflection entries and mood labels",
    },
    {
      name: "Notes",
      icon: "note",
      description: "Capture ideas instantly.",
      detail: "A place for the ideas, plans, and insights that deserve your attention.",
      topics: ["Ideas", "Plans", "Insights"],
      prompt: "What is on your mind?",
      image: "assets/mobile-tasks.png",
      imageAlt: "Evolution OS mobile tasks and habits screen for organizing plans and ideas",
    },
    {
      name: "Investing",
      icon: "lineChart",
      description: "P&L tracking and equity curve.",
      detail: "Keep your investment results in view through P&L and your equity curve.",
      topics: ["Profit & loss", "Equity curve"],
      prompt: "What do the results tell you?",
      image: "public/showcase/investing-demo.png",
      imageAlt: "Evolution OS Investing dashboard with trading calendar, profit and loss, and account history",
    },
    {
      name: "Business",
      icon: "briefcase",
      description: "Projects, revenue, and business goals.",
      detail: "Keep the work you're building alongside the results you're reviewing.",
      topics: ["Projects", "Revenue", "Business goals"],
      prompt: "What deserves your focus next?",
      image: "public/showcase/business-demo.png",
      imageAlt: "Evolution OS Business dashboard with projects, progress, and revenue",
    },
  ];
  const SHOTS = [
    {
      title: "Business",
      src: "public/showcase/business-demo.png",
      caption: "Review projects, progress, and revenue in one workspace.",
      alt: "Evolution app guest Business screenshot with sample revenue, project progress cards, and a cumulative revenue chart",
    },
    {
      title: "Journal",
      src: "public/showcase/journal-demo.png",
      caption: "Revisit entries, moods, and reflection tags.",
      alt: "Evolution app guest Journal screenshot with three fictional entries, mood labels, and reflection tags",
    },
    {
      title: "Investing",
      src: "public/showcase/investing-demo.png",
      caption: "Inspect the trading calendar, P&L, accounts, and transaction history.",
      alt: "Evolution app guest Investing screenshot with a sample trading calendar, profit and loss, accounts, and transaction history",
    },
    {
      title: "Wealth",
      src: "public/showcase/wealth-demo.png",
      caption: "Review manual financial records, net worth, and asset allocation.",
      alt: "Evolution app guest Wealth screenshot with fictional net worth, manual financial records, asset allocation, and recent transactions",
    },
  ];
  const FAQS = [
    [
      "What is Evolution OS?",
      "Evolution OS is a life operating system built around seven areas: Wealth, Nutrition, Fitness, Journal, Notes, Investing, and Business, alongside a Focus Mode for productive work. This website is a product overview, not the app itself.",
    ],
    [
      "Can I use the dashboard on this website?",
      "The dashboard shown here is the actual Evolution OS interface. You can enlarge the screenshot and explore the module descriptions, but this promotional website doesn't run the product or save your data.",
    ],
    ["How can I get access, and what will it cost?", promoSalesCopy.section3],
    [
      "How do Notes and Focus Mode fit together?",
      "The intent is a simple rhythm: capture ideas and plans in Notes, set aside time to execute in Focus Mode, then review your progress in the relevant module. It's a way to connect planning, focused effort, and reflection.",
    ],
    ["What about privacy, syncing, and imports?", promoSalesCopy.section4],
  ];
  const P = "oklch(0.82 0.14 205)",
    MF = "oklch(0.72 0.018 225)",
    FG = "oklch(0.965 0.006 220)",
    SEC = "oklch(0.22 0.019 230)",
    BD = "oklch(0.35 0.019 230 / 0.52)";
  class EvolutionPage2 extends React.Component {
    state = { active: 0, faq: -1, nav: "", shot: -1, phone: -1, scrolled: false };
    componentDidMount() {
      this.onScroll = () => {
        const s = window.scrollY > 24;
        if (s !== this.state.scrolled) this.setState({ scrolled: s });
      };
      this.onKey = (e) => {
        if (this.state.shot < 0 && this.state.phone < 0) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.closeLb();
          return;
        }
        if (e.key === "Tab") {
          const d = document.querySelector("[role=dialog]");
          if (!d) return;
          const f = [...d.querySelectorAll("a[href],button")];
          if (!f.length) return;
          const a = f[0],
            z = f[f.length - 1];
          if (!d.contains(document.activeElement)) {
            e.preventDefault();
            a.focus();
          } else if (e.shiftKey && document.activeElement === a) {
            e.preventDefault();
            z.focus();
          } else if (!e.shiftKey && document.activeElement === z) {
            e.preventDefault();
            a.focus();
          }
        }
      };
      window.addEventListener("scroll", this.onScroll, { passive: true });
      window.addEventListener("keydown", this.onKey, true);
      this.onScroll();
    }
    keyMod(ev, i) {
      const n = MODULES.length;
      let j = null;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") j = (i + 1) % n;
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") j = (i - 1 + n) % n;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = n - 1;
      if (j === null) return;
      ev.preventDefault();
      this.setState({ active: j }, () => {
        const el = document.getElementById("mod-tab-" + j);
        if (el) el.focus();
      });
    }
    closeLb() {
      this.setState({ shot: -1, phone: -1 }, () => {
        const t = this.trigger;
        if (t && document.contains(t)) t.focus();
      });
    }
    componentWillUnmount() {
      window.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("keydown", this.onKey, true);
    }
    renderVals() {
      const { active, faq, nav, shot, phone, scrolled } = this.state;
      const openM = (i) => (e) => {
        this.trigger = e.currentTarget;
        this.setState({ phone: i }, () => {
          const b = document.getElementById("lb-close");
          if (b) b.focus();
        });
      };
      const gradient = this.props.gradientHeadline ?? true;
      const m = MODULES[active];
      return {
        showCircuit: this.props.showCircuit ?? true,
        gradientHeadline: gradient,
        solidHeadline: !gradient,
        headerBorder: scrolled ? BD : "transparent",
        year: new Date().getFullYear(),
        nav: NAV.map(([id, label]) => ({
          id,
          label,
          color: nav === id ? P : MF,
          line: nav === id ? P : "transparent",
          onClick: () => this.setState({ nav: id }),
        })),
        pillars: PILLARS.map(([i, title, text]) => ({ icon: icon(i, 21, 1.5), title, text })),
        values: VALUES.map(([i, title, text]) => ({ icon: icon(i, 22, 1.5), title, text })),
        flow: FLOW.map(([i, step, title, text]) => ({ icon: icon(i, 17, 1.5), step, title, text })),
        modules: MODULES.map((mod, i) => ({
          id: "mod-tab-" + i,
          tab: i === active ? 0 : -1,
          onKey: (ev) => this.keyMod(ev, i),
          name: mod.name,
          num: "0" + (i + 1),
          icon: icon(mod.icon, 19, 1.5),
          selected: i === active ? "true" : "false",
          bg: i === active ? SEC : "transparent",
          color: i === active ? P : FG,
          border: i === MODULES.length - 1 ? "transparent" : BD,
          chevron: i === active ? "rotate(90deg)" : "none",
          onClick: () => this.setState({ active: i }),
        })),
        active: { ...m, tabId: "mod-tab-" + active, num: "0" + (active + 1), bigIcon: icon(m.icon, 30, 1) },
        ...Object.fromEntries(
          SHOTS.map((s, i) => [
            "desktopOpen" + i,
            (e) => {
              this.trigger = e.currentTarget;
              this.setState({ shot: i }, () => {
                const b = document.getElementById("lb-close");
                if (b) b.focus();
              });
            },
          ]),
        ),
        open0: openM(0),
        open1: openM(1),
        open2: openM(2),
        open3: openM(3),
        lbp: MSHOTS[phone] || MSHOTS[0],
        phoneOpen: phone >= 0,
        lightboxOpen: shot >= 0,
        lb: SHOTS[shot] || SHOTS[0],
        closeLightbox: () => this.closeLb(),
        stop: (e) => e.stopPropagation(),
        faqs: FAQS.map(([question, answer], i) => ({
          question,
          answer,
          open: faq === i,
          hasLink: i === 2,
          plusRot: faq === i ? "rotate(45deg)" : "none",
          toggle: () => this.setState({ faq: faq === i ? -1 : i }),
        })),
      };
    }
    render() {
      const _renderData = this.renderVals();
      const {
        active,
        alt,
        answer,
        bg,
        bigIcon,
        border,
        chevron,
        closeLightbox,
        color,
        description,
        desktopOpen0,
        desktopOpen1,
        desktopOpen2,
        desktopOpen3,
        detail,
        f,
        faqs,
        flow,
        gradientHeadline,
        h,
        hasLink,
        headerBorder,
        icon: icon2,
        id,
        label,
        lb,
        lbp,
        lightboxOpen,
        line,
        m,
        modules,
        n,
        name,
        nav,
        num,
        onClick,
        onKey,
        open,
        open0,
        open1,
        open2,
        open3,
        p,
        phoneOpen,
        pillars,
        plusRot,
        prompt,
        q,
        question,
        selected,
        showCircuit,
        solidHeadline,
        src,
        step,
        stop,
        t,
        tab,
        tabId,
        text,
        title,
        toggle,
        topics,
        v,
        values,
        w,
        year,
      } = _renderData;
      return jsxs(Fragment, {
        children: [
          jsx("style", {
            children: resolveAssets(
              "\nhtml{scroll-behavior:smooth;scroll-padding-top:96px}\na:focus-visible,button:focus-visible{outline:3px solid oklch(0.82 0.14 205);outline-offset:3px;border-radius:2px}\n@media (max-width:900px){html{scroll-padding-top:150px}.lp-nav{order:3;flex:1 1 100%!important;justify-content:flex-start!important;flex-wrap:nowrap!important;overflow-x:auto}.lp-nav a{flex-shrink:0}}\n.lp-ph{grid-template-columns:repeat(2,minmax(0,1fr))}\n@media (max-width:620px){.lp-ph{grid-template-columns:minmax(0,1fr)}}\n@media (max-width:520px){.lp-cta{display:none!important}}\n@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;scroll-behavior:auto!important}}\nbody{margin:0;background:oklch(0.125 0.009 240);color:oklch(0.965 0.006 220);font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\nh1,h2,h3,h4,p{margin:0}\na{color:oklch(0.82 0.14 205);text-decoration:none}\na:hover{color:oklch(0.82 0.14 205)}\n::selection{background:oklch(0.82 0.14 205);color:oklch(0.14 0.016 225)}\n",
            ),
          }),
          jsxs("div", {
            style: {
              position: resolveAssets("relative"),
              isolation: resolveAssets("isolate"),
              overflow: resolveAssets("clip"),
              background: resolveAssets("oklch(0.125 0.009 240)"),
              color: resolveAssets("oklch(0.965 0.006 220)"),
              fontFamily: resolveAssets("Inter,ui-sans-serif,system-ui,sans-serif"),
              minHeight: resolveAssets("100vh"),
            },
            children: [
              showCircuit
                ? jsx(Fragment, {
                    children: jsx("div", {
                      style: {
                        position: resolveAssets("absolute"),
                        inset: resolveAssets("0"),
                        zIndex: resolveAssets("-1"),
                        pointerEvents: resolveAssets("none"),
                        backgroundColor: resolveAssets("oklch(0.82 0.14 205 / 0.24)"),
                        WebkitMaskImage: resolveAssets("url(assets/circuit-board.svg)"),
                        maskImage: resolveAssets("url(assets/circuit-board.svg)"),
                        WebkitMaskSize: resolveAssets("1368px 1520px"),
                        maskSize: resolveAssets("1368px 1520px"),
                        WebkitMaskRepeat: resolveAssets("repeat"),
                        maskRepeat: resolveAssets("repeat"),
                      },
                    }),
                  })
                : null,
              jsx("header", {
                "data-screen-label": "Header",
                style: {
                  position: resolveAssets("sticky"),
                  top: resolveAssets("0"),
                  zIndex: resolveAssets("40"),
                  borderBottom: resolveAssets("1px solid " + headerBorder),
                  background: resolveAssets("oklch(0.125 0.009 240 / 0.9)"),
                  backdropFilter: resolveAssets("blur(18px)"),
                  WebkitBackdropFilter: resolveAssets("blur(18px)"),
                  transition: resolveAssets("border-color 200ms"),
                },
                children: jsxs("div", {
                  style: {
                    maxWidth: resolveAssets("1440px"),
                    margin: resolveAssets("0 auto"),
                    padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                    display: resolveAssets("flex"),
                    alignItems: resolveAssets("center"),
                    flexWrap: resolveAssets("wrap"),
                    gap: resolveAssets("0 30px"),
                    minHeight: resolveAssets("112px"),
                  },
                  children: [
                    jsxs("a", {
                      href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                      "aria-label": "All Evolution products",
                      style: {
                        display: resolveAssets("inline-flex"),
                        alignItems: resolveAssets("center"),
                        gap: resolveAssets("18px"),
                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                        fontWeight: resolveAssets("700"),
                        fontSize: resolveAssets("28px"),
                        color: resolveAssets("oklch(0.965 0.006 220)"),
                        flexShrink: resolveAssets("0"),
                      },
                      children: [
                        jsx("img", {
                          src: asset("assets/bonsai-logo.png"),
                          alt: "Evolution OS bonsai logo",
                          style: {
                            width: resolveAssets("68px"),
                            height: resolveAssets("62px"),
                            objectFit: resolveAssets("contain"),
                          },
                        }),
                        jsxs("span", {
                          children: [
                            "EVOLUTION",
                            jsx("span", { style: { color: resolveAssets("oklch(0.72 0.018 225)") }, children: " OS" }),
                          ],
                        }),
                      ],
                    }),
                    jsx("nav", {
                      className: "lp-nav",
                      "aria-label": "Main navigation",
                      style: {
                        flex: resolveAssets("1 1 0"),
                        minWidth: resolveAssets("0"),
                        display: resolveAssets("flex"),
                        flexWrap: resolveAssets("wrap"),
                        justifyContent: resolveAssets("center"),
                        columnGap: resolveAssets("28px"),
                      },
                      children: (nav || []).map((n2, index) =>
                        jsx(
                          React.Fragment,
                          {
                            children: jsx("a", {
                              href: resolveAssets("#" + n2.id),
                              onClick: n2.onClick,
                              style: {
                                position: resolveAssets("relative"),
                                display: resolveAssets("flex"),
                                alignItems: resolveAssets("center"),
                                height: resolveAssets("48px"),
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                textTransform: resolveAssets("uppercase"),
                                whiteSpace: resolveAssets("nowrap"),
                                color: resolveAssets(n2.color),
                                borderBottom: resolveAssets("1px solid " + n2.line),
                                boxSizing: resolveAssets("border-box"),
                                transition: resolveAssets("color 180ms"),
                              },
                              className: "ported-hover-15",
                              children: n2.label,
                            }),
                          },
                          index,
                        ),
                      ),
                    }),
                    jsxs("a", {
                      href: resolveAssets("/?section=account"),
                      target: "_top",
                      style: {
                        display: resolveAssets("inline-flex"),
                        alignItems: resolveAssets("center"),
                        gap: resolveAssets("8px"),
                        minHeight: resolveAssets("44px"),
                        padding: resolveAssets("0 16px"),
                        borderRadius: resolveAssets("6px"),
                        background: resolveAssets("oklch(0.82 0.14 205)"),
                        color: resolveAssets("oklch(0.14 0.016 225)"),
                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                        fontSize: resolveAssets("12px"),
                        fontWeight: resolveAssets("500"),
                        textTransform: resolveAssets("uppercase"),
                        whiteSpace: resolveAssets("nowrap"),
                        flexShrink: resolveAssets("0"),
                      },
                      className: "lp-cta ported-hover-16",
                      children: [
                        "Open Evolution OS ",
                        jsxs("svg", {
                          width: "14",
                          height: "14",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          children: [jsx("path", { d: "M7 7h10v10" }), jsx("path", { d: "M7 17 17 7" })],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              jsxs("main", {
                style: {
                  display: resolveAssets("flex"),
                  flexDirection: resolveAssets("column"),
                },
                children: [
                  jsxs("section", {
                    id: "top",
                    "data-screen-label": "Hero",
                    style: {
                      order: resolveAssets("-2"),
                      position: resolveAssets("relative"),
                      isolation: resolveAssets("isolate"),
                      paddingTop: resolveAssets("80px"),
                      background: resolveAssets(
                        "radial-gradient(ellipse at 70% 70%, oklch(0.28 0.054 220 / 0.45), transparent 65%)",
                      ),
                    },
                    children: [
                      jsxs("div", {
                        style: {
                          maxWidth: resolveAssets("1440px"),
                          margin: resolveAssets("0 auto"),
                          padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                          display: resolveAssets("flex"),
                          flexWrap: resolveAssets("wrap"),
                          alignItems: resolveAssets("center"),
                          gap: resolveAssets("48px"),
                        },
                        children: [
                          jsxs("div", {
                            style: {
                              position: resolveAssets("relative"),
                              zIndex: resolveAssets("2"),
                              flex: resolveAssets("1 1 420px"),
                              minWidth: resolveAssets("0"),
                            },
                            children: [
                              jsxs("p", {
                                style: {
                                  fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                  fontSize: resolveAssets("12px"),
                                  fontWeight: resolveAssets("500"),
                                  lineHeight: resolveAssets("1.8"),
                                  textTransform: resolveAssets("uppercase"),
                                  color: resolveAssets("oklch(0.82 0.14 205)"),
                                  display: resolveAssets("flex"),
                                  alignItems: resolveAssets("center"),
                                  gap: resolveAssets("10px"),
                                },
                                children: [
                                  jsx("span", {
                                    style: {
                                      width: resolveAssets("5px"),
                                      height: resolveAssets("5px"),
                                      borderRadius: resolveAssets("50%"),
                                      background: resolveAssets("oklch(0.78 0.14 172)"),
                                    },
                                  }),
                                  "Evolution OS / Life, considered",
                                ],
                              }),
                              jsxs("h1", {
                                style: {
                                  fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                  fontSize: resolveAssets("clamp(38px,4.6vw,72px)"),
                                  fontWeight: resolveAssets("700"),
                                  lineHeight: resolveAssets("1.06"),
                                  marginTop: resolveAssets("26px"),
                                  textWrap: resolveAssets("balance"),
                                },
                                children: [
                                  gradientHeadline
                                    ? jsx("span", {
                                        style: {
                                          background: resolveAssets(
                                            "linear-gradient(120deg, oklch(0.82 0.14 205), oklch(0.78 0.14 172))",
                                          ),
                                          WebkitBackgroundClip: resolveAssets("text"),
                                          backgroundClip: resolveAssets("text"),
                                          color: resolveAssets("transparent"),
                                        },
                                        children: "Evolution OS ",
                                      })
                                    : jsx("span", {
                                        style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                        children: "Evolution OS ",
                                      }),
                                  gradientHeadline
                                    ? jsx(Fragment, {
                                        children: jsx("span", {
                                          style: {
                                            color: resolveAssets("#ffffff"),
                                            fontSize: resolveAssets("0.44em"),
                                            verticalAlign: resolveAssets("middle"),
                                          },
                                          children: "v1.0",
                                        }),
                                      })
                                    : solidHeadline
                                      ? jsx(Fragment, {
                                          children: jsx("span", {
                                            style: { color: resolveAssets("#ffffff"), fontSize: resolveAssets("0.44em"), verticalAlign: resolveAssets("middle") },
                                            children: "v1.0",
                                          }),
                                        })
                                      : jsx("span", { style: { color: resolveAssets("#ffffff"), fontSize: resolveAssets("0.44em"), verticalAlign: resolveAssets("middle") }, children: "v1.0" }),
                                ],
                              }),
                              jsx("p", {
                                style: {
                                  fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                  fontSize: resolveAssets("clamp(19px,2.3vw,32px)"),
                                  fontWeight: resolveAssets("600"),
                                  lineHeight: resolveAssets("1.3"),
                                  marginTop: resolveAssets("12px"),
                                  textWrap: resolveAssets("balance"),
                                },
                                children: gradientHeadline
                                  ? jsx("span", {
                                      style: {
                                        background: resolveAssets(
                                          "linear-gradient(120deg, oklch(0.82 0.14 205), oklch(0.78 0.14 172))",
                                        ),
                                        WebkitBackgroundClip: resolveAssets("text"),
                                        backgroundClip: resolveAssets("text"),
                                        color: resolveAssets("transparent"),
                                      },
                                      children: "The system for your best self.",
                                    })
                                  : solidHeadline
                                    ? jsx("span", {
                                        style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                        children: "The system for your best self.",
                                      })
                                    : jsx("span", {
                                        style: {
                                          color: resolveAssets("oklch(0.88 0.02 210)"),
                                        },
                                        children: "The system for your best self.",
                                      }),
                              }),
                              jsx("div", {
                                style: {
                                  display: resolveAssets("grid"),
                                  gridTemplateColumns: resolveAssets("repeat(3,minmax(0,1fr))"),
                                  gap: resolveAssets("clamp(12px,1.7vw,24px)"),
                                  marginTop: resolveAssets("34px"),
                                  maxWidth: resolveAssets("510px"),
                                },
                                children: (pillars || []).map((p2, index) =>
                                  jsx(
                                    React.Fragment,
                                    {
                                      children: jsxs("div", {
                                        style: { minWidth: resolveAssets("0") },
                                        children: [
                                          jsx("span", {
                                            style: {
                                              display: resolveAssets("block"),
                                              color: resolveAssets("oklch(0.82 0.14 205)"),
                                              height: resolveAssets("30px"),
                                            },
                                            children: p2.icon,
                                          }),
                                          jsx("h2", {
                                            style: {
                                              fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                              fontSize: resolveAssets("16px"),
                                              fontWeight: resolveAssets("500"),
                                              textTransform: resolveAssets("uppercase"),
                                              marginTop: resolveAssets("12px"),
                                              lineHeight: resolveAssets("1.65"),
                                            },
                                            children: p2.title,
                                          }),
                                          jsx("p", {
                                            style: {
                                              fontSize: resolveAssets("14px"),
                                              lineHeight: resolveAssets("1.7"),
                                              color: resolveAssets("oklch(0.72 0.018 225)"),
                                              marginTop: resolveAssets("7px"),
                                            },
                                            children: p2.text,
                                          }),
                                        ],
                                      }),
                                    },
                                    index,
                                  ),
                                ),
                              }),
                              jsxs("div", {
                                style: {
                                  display: resolveAssets("flex"),
                                  gap: resolveAssets("10px"),
                                  flexWrap: resolveAssets("wrap"),
                                  marginTop: resolveAssets("34px"),
                                },
                                children: [
                                  jsxs("a", {
                                    href: resolveAssets("/?section=account"),
                                    style: {
                                      display: resolveAssets("inline-flex"),
                                      alignItems: resolveAssets("center"),
                                      gap: resolveAssets("8px"),
                                      minHeight: resolveAssets("48px"),
                                      boxSizing: resolveAssets("border-box"),
                                      padding: resolveAssets("14px 20px"),
                                      borderRadius: resolveAssets("4px"),
                                      background: resolveAssets("oklch(0.82 0.14 205)"),
                                      color: resolveAssets("oklch(0.14 0.016 225)"),
                                      fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                      fontSize: resolveAssets("12px"),
                                      fontWeight: resolveAssets("500"),
                                      textTransform: resolveAssets("uppercase"),
                                      transition: resolveAssets("transform 180ms cubic-bezier(0.2,0.7,0.2,1)"),
                                    },
                                    className: "ported-hover-17",
                                    children: [
                                      "Sign Up",
                                    ],
                                  }),
                                  jsx("a", {
                                    href: resolveAssets("#system"),
                                    style: {
                                      display: resolveAssets("inline-flex"),
                                      alignItems: resolveAssets("center"),
                                      minHeight: resolveAssets("48px"),
                                      boxSizing: resolveAssets("border-box"),
                                      padding: resolveAssets("14px 20px"),
                                      borderRadius: resolveAssets("4px"),
                                      border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                      color: resolveAssets("oklch(0.965 0.006 220)"),
                                      fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                      fontSize: resolveAssets("12px"),
                                      fontWeight: resolveAssets("500"),
                                      textTransform: resolveAssets("uppercase"),
                                      transition: resolveAssets(
                                        "transform 180ms cubic-bezier(0.2,0.7,0.2,1),background 180ms",
                                      ),
                                    },
                                    className: "ported-hover-18",
                                    children: ["Explore Evolution OS ", jsx("span", { "aria-hidden": "true", children: "→" })],
                                  }),
                                ],
                              }),
                              jsxs("p", {
                                style: {
                                  fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                  fontSize: resolveAssets("12px"),
                                  color: resolveAssets("oklch(0.72 0.018 225)"),
                                  textTransform: resolveAssets("uppercase"),
                                  marginTop: resolveAssets("25px"),
                                  display: resolveAssets("flex"),
                                  alignItems: resolveAssets("center"),
                                  gap: resolveAssets("10px"),
                                },
                                children: [
                                  jsx("span", {
                                    style: {
                                      width: resolveAssets("5px"),
                                      height: resolveAssets("5px"),
                                      borderRadius: resolveAssets("50%"),
                                      background: resolveAssets("oklch(0.78 0.14 172)"),
                                    },
                                  }),
                                  "Built for the disciplined few",
                                ],
                              }),
                            ],
                          }),
                          jsxs("div", {
                            style: {
                              position: resolveAssets("relative"),
                              isolation: resolveAssets("isolate"),
                              flex: resolveAssets("1.17 1 480px"),
                              minWidth: resolveAssets("0"),
                              padding: resolveAssets("90px 0 45px"),
                            },
                            children: [
                              jsx("img", {
                                src: asset("assets/mountain-bg.png"),
                                alt: "",
                                "aria-hidden": "true",
                                style: {
                                  position: resolveAssets("absolute"),
                                  zIndex: resolveAssets("0"),
                                  top: resolveAssets("-65px"),
                                  left: resolveAssets("-90px"),
                                  width: resolveAssets("calc(100% + 180px)"),
                                  maxWidth: resolveAssets("none"),
                                  height: resolveAssets("calc(100% + 110px)"),
                                  objectFit: resolveAssets("cover"),
                                  objectPosition: resolveAssets("58% center"),
                                  opacity: resolveAssets("0.9"),
                                  WebkitMaskImage: resolveAssets(
                                    "linear-gradient(90deg, transparent, black 13%, black 85%, transparent)",
                                  ),
                                  maskImage: resolveAssets(
                                    "linear-gradient(90deg, transparent, black 13%, black 85%, transparent)",
                                  ),
                                },
                              }),
                              jsx("div", {
                                style: {
                                  position: resolveAssets("absolute"),
                                  zIndex: resolveAssets("1"),
                                  top: resolveAssets("-65px"),
                                  left: resolveAssets("-90px"),
                                  right: resolveAssets("-90px"),
                                  bottom: resolveAssets("-45px"),
                                  pointerEvents: resolveAssets("none"),
                                  background: resolveAssets(
                                    "linear-gradient(0deg, oklch(0.125 0.009 240), transparent 30%, transparent 72%, oklch(0.125 0.009 240))",
                                  ),
                                },
                              }),
                              jsxs("div", {
                                style: {
                                  position: resolveAssets("relative"),
                                  zIndex: resolveAssets("2"),
                                  transform: resolveAssets("rotateY(-5deg) rotateX(2deg)"),
                                  transition: resolveAssets("transform 500ms cubic-bezier(0.2,0.7,0.2,1)"),
                                },
                                className: "ported-hover-19",
                                children: [
                                  jsxs("div", {
                                    style: {
                                      position: resolveAssets("relative"),
                                      border: resolveAssets("1px solid oklch(0.42 0.009 230)"),
                                      background: resolveAssets("oklch(0.07 0.005 230)"),
                                      padding: resolveAssets("15px 10px 12px"),
                                      borderRadius: resolveAssets("13px 13px 2px 2px"),
                                      boxShadow: resolveAssets("0 24px 70px -18px oklch(0 0 0 / 0.9)"),
                                    },
                                    children: [
                                      jsx("div", {
                                        style: {
                                          position: resolveAssets("absolute"),
                                          top: resolveAssets("5px"),
                                          left: resolveAssets("calc(50% - 2px)"),
                                          width: resolveAssets("4px"),
                                          height: resolveAssets("4px"),
                                          borderRadius: resolveAssets("50%"),
                                          background: resolveAssets("oklch(0.25 0.008 230)"),
                                        },
                                      }),
                                      jsx("img", {
                                        src: asset("assets/dashboard-hero.jpg"),
                                        width: "1401",
                                        height: "807",
                                        alt: "The real Evolution OS dashboard displayed inside a laptop",
                                        style: {
                                          display: resolveAssets("block"),
                                          width: resolveAssets("100%"),
                                          height: resolveAssets("auto"),
                                          border: resolveAssets("1px solid oklch(0.25 0.008 230)"),
                                          borderRadius: resolveAssets("2px"),
                                          boxSizing: resolveAssets("border-box"),
                                        },
                                      }),
                                    ],
                                  }),
                                  jsx("div", {
                                    style: {
                                      position: resolveAssets("relative"),
                                      width: resolveAssets("110%"),
                                      marginLeft: resolveAssets("-5%"),
                                      height: resolveAssets("15px"),
                                      boxSizing: resolveAssets("border-box"),
                                      borderRadius: resolveAssets("1px 1px 50% 50% / 1px 1px 12px 12px"),
                                      background: resolveAssets(
                                        "linear-gradient(180deg, oklch(0.42 0.009 230), oklch(0.25 0.008 230) 40%, oklch(0.07 0.005 230))",
                                      ),
                                      border: resolveAssets("1px solid oklch(0.42 0.009 230)"),
                                      boxShadow: resolveAssets("0 24px 70px -18px oklch(0 0 0 / 0.9)"),
                                    },
                                    children: jsx("div", {
                                      style: {
                                        position: resolveAssets("absolute"),
                                        top: resolveAssets("0"),
                                        left: resolveAssets("42%"),
                                        width: resolveAssets("16%"),
                                        height: resolveAssets("4px"),
                                        background: resolveAssets("oklch(0.25 0.008 230)"),
                                        borderRadius: resolveAssets("0 0 6px 6px"),
                                      },
                                    }),
                                  }),
                                ],
                              }),
                              jsxs("div", {
                                style: {
                                  position: resolveAssets("relative"),
                                  zIndex: resolveAssets("2"),
                                  display: resolveAssets("flex"),
                                  flexWrap: resolveAssets("wrap"),
                                  textAlign: resolveAssets("center"),
                                  alignItems: resolveAssets("center"),
                                  justifyContent: resolveAssets("center"),
                                  gap: resolveAssets("8px 15px"),
                                  marginTop: resolveAssets("30px"),
                                  fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                  color: resolveAssets("oklch(0.72 0.018 225)"),
                                  fontSize: resolveAssets("12px"),
                                  textTransform: resolveAssets("uppercase"),
                                },
                                children: [
                                  jsx("span", {
                                    style: {
                                      width: resolveAssets("24px"),
                                      height: resolveAssets("1px"),
                                      background: resolveAssets("oklch(0.82 0.14 205)"),
                                    },
                                  }),
                                  jsx("span", {
                                    children:
                                      "One perspective. Your whole system. \xB7 Design preview \xB7 sample data",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      jsxs("div", {
                        style: {
                          maxWidth: resolveAssets("1440px"),
                          margin: resolveAssets("16px auto 0"),
                          padding: resolveAssets("62px clamp(20px,3.4vw,48px) 25px"),
                          display: resolveAssets("flex"),
                          alignItems: resolveAssets("center"),
                          justifyContent: resolveAssets("space-between"),
                          gap: resolveAssets("16px"),
                        },
                        children: [
                          jsx("span", {
                            style: {
                              fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                              fontSize: resolveAssets("12px"),
                              fontWeight: resolveAssets("500"),
                              textTransform: resolveAssets("uppercase"),
                              color: resolveAssets("oklch(0.72 0.018 225)"),
                            },
                            children: "Built with intention",
                          }),
                          jsxs("a", {
                            href: resolveAssets("#system"),
                            "aria-label": "Discover the seven Evolution OS surfaces",
                            style: {
                              display: resolveAssets("flex"),
                              alignItems: resolveAssets("center"),
                              gap: resolveAssets("16px"),
                              color: resolveAssets("oklch(0.72 0.018 225)"),
                              fontSize: resolveAssets("12px"),
                              fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                              transition: resolveAssets("color 180ms"),
                            },
                            className: "ported-hover-20",
                            children: [
                              jsx("span", { children: "Discover more" }),
                              jsxs("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "oklch(0.82 0.14 205)",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                style: { transform: resolveAssets("rotate(90deg)") },
                                children: [jsx("path", { d: "M5 12h14" }), jsx("path", { d: "m12 5 7 7-7 7" })],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  jsx("section", {
                    id: "features",
                    "data-screen-label": "Philosophy",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("62px 0"),
                      scrollMarginTop: resolveAssets("96px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: {
                            display: resolveAssets("flex"),
                            flexWrap: resolveAssets("wrap"),
                            gap: resolveAssets("16px 48px"),
                            alignItems: resolveAssets("start"),
                          },
                          children: [
                            jsx("p", {
                              style: {
                                flex: resolveAssets("0 0 230px"),
                                paddingTop: resolveAssets("8px"),
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                fontWeight: resolveAssets("500"),
                                lineHeight: resolveAssets("1.8"),
                                textTransform: resolveAssets("uppercase"),
                                color: resolveAssets("oklch(0.82 0.14 205)"),
                              },
                              children: "An intentional approach",
                            }),
                            jsxs("h2", {
                              style: {
                                flex: resolveAssets("1 1 360px"),
                                fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                fontSize: resolveAssets("clamp(29px,3vw,36px)"),
                                fontWeight: resolveAssets("700"),
                                lineHeight: resolveAssets("1.15"),
                              },
                              children: [
                                "Built for those who",
                                jsx("br", {}),
                                jsx("span", {
                                  style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                  children: "refuse to settle.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        jsx("div", {
                          style: {
                            display: resolveAssets("grid"),
                            gridTemplateColumns: resolveAssets("repeat(auto-fit,minmax(min(100%,210px),1fr))"),
                            gap: resolveAssets("30px 36px"),
                            marginTop: resolveAssets("38px"),
                          },
                          children: (values || []).map((v2, index) =>
                            jsx(
                              React.Fragment,
                              {
                                children: jsxs("article", {
                                  style: {
                                    borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                    paddingTop: resolveAssets("25px"),
                                  },
                                  children: [
                                    jsx("span", {
                                      style: {
                                        display: resolveAssets("block"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                        height: resolveAssets("22px"),
                                      },
                                      children: v2.icon,
                                    }),
                                    jsx("h3", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        fontWeight: resolveAssets("500"),
                                        textTransform: resolveAssets("uppercase"),
                                        marginTop: resolveAssets("20px"),
                                      },
                                      children: v2.title,
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("13px"),
                                        lineHeight: resolveAssets("1.85"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                        marginTop: resolveAssets("12px"),
                                        textWrap: resolveAssets("pretty"),
                                      },
                                      children: v2.text,
                                    }),
                                  ],
                                }),
                              },
                              index,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "system",
                    "data-screen-label": "Modules",
                    style: {
                      order: resolveAssets("-1"),
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("88px 0"),
                      scrollMarginTop: resolveAssets("96px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: {
                            display: resolveAssets("flex"),
                            flexWrap: resolveAssets("wrap"),
                            justifyContent: resolveAssets("space-between"),
                            alignItems: resolveAssets("flex-end"),
                            gap: resolveAssets("22px 48px"),
                            marginBottom: resolveAssets("40px"),
                          },
                          children: [
                            jsxs("div", {
                              style: { flex: resolveAssets("1 1 420px") },
                              children: [
                                jsxs("h2", {
                                  style: {
                                    fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                    fontSize: resolveAssets("clamp(33px,3.6vw,44px)"),
                                    fontWeight: resolveAssets("700"),
                                    lineHeight: resolveAssets("1.15"),
                                  },
                                  children: [
                                    "Multiple surfaces.",
                                    jsx("br", {}),
                                    jsx("span", {
                                      style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                      children: "One system.",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            jsx("p", {
                              style: {
                                flex: resolveAssets("0 1 380px"),
                                fontSize: resolveAssets("14px"),
                                lineHeight: resolveAssets("1.85"),
                                color: resolveAssets("oklch(0.72 0.018 225)"),
                                textWrap: resolveAssets("pretty"),
                              },
                              children:
                                "From the ideas in your notes to the work in your day. Explore the seven areas at the heart of Evolution OS.",
                            }),
                          ],
                        }),
                        jsxs("div", {
                          style: {
                            display: resolveAssets("flex"),
                            flexWrap: resolveAssets("wrap"),
                            borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                            borderBottom: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                          },
                          children: [
                            jsx("div", {
                              role: "tablist",
                              "aria-label": "Modules",
                              style: {
                                flex: resolveAssets("1 1 300px"),
                                display: resolveAssets("flex"),
                                flexDirection: resolveAssets("column"),
                              },
                              children: (modules || []).map((m2, index) =>
                                jsx(
                                  React.Fragment,
                                  {
                                    children: jsxs("button", {
                                      type: "button",
                                      role: "tab",
                                      id: m2.id,
                                      "aria-controls": "mod-panel",
                                      "aria-selected": m2.selected,
                                      tabIndex: m2.tab,
                                      onKeyDown: m2.onKey,
                                      onClick: m2.onClick,
                                      style: {
                                        display: resolveAssets("grid"),
                                        gridTemplateColumns: resolveAssets("24px 22px minmax(0,1fr) 18px"),
                                        alignItems: resolveAssets("center"),
                                        gap: resolveAssets("18px"),
                                        minHeight: resolveAssets("64px"),
                                        padding: resolveAssets("0 16px"),
                                        border: resolveAssets("0"),
                                        borderBottom: resolveAssets("1px solid " + m2.border),
                                        background: resolveAssets(m2.bg),
                                        color: resolveAssets(m2.color),
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("15px"),
                                        textAlign: resolveAssets("left"),
                                        cursor: resolveAssets("pointer"),
                                        transition: resolveAssets("background 180ms,color 180ms"),
                                      },
                                      className: "ported-hover-21",
                                      children: [
                                        jsx("span", {
                                          style: {
                                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                            fontSize: resolveAssets("12px"),
                                            color: resolveAssets("oklch(0.72 0.018 225)"),
                                          },
                                          children: m2.num,
                                        }),
                                        jsx("span", {
                                          style: {
                                            display: resolveAssets("flex"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                          },
                                          children: m2.icon,
                                        }),
                                        jsx("span", { children: m2.name }),
                                        jsx("svg", {
                                          width: "15",
                                          height: "15",
                                          viewBox: "0 0 24 24",
                                          fill: "none",
                                          stroke: "currentColor",
                                          strokeWidth: "2",
                                          strokeLinecap: "round",
                                          strokeLinejoin: "round",
                                          style: {
                                            transform: resolveAssets(m2.chevron),
                                            transition: resolveAssets("transform 200ms"),
                                          },
                                          children: jsx("path", { d: "m9 18 6-6-6-6" }),
                                        }),
                                      ],
                                    }),
                                  },
                                  index,
                                ),
                              ),
                            }),
                            jsxs("div", {
                              role: "tabpanel",
                              id: "mod-panel",
                              "aria-labelledby": active.tabId,
                              style: {
                                flex: resolveAssets("999 1 460px"),
                                minWidth: resolveAssets("0"),
                                borderLeft: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                background: resolveAssets(
                                  "linear-gradient(130deg, oklch(0.17 0.012 230), oklch(0.125 0.009 240))",
                                ),
                                display: resolveAssets("flex"),
                                flexDirection: resolveAssets("column"),
                                padding: resolveAssets("32px clamp(20px,3vw,40px)"),
                                boxSizing: resolveAssets("border-box"),
                                minHeight: resolveAssets("680px"),
                              },
                              children: [
                                jsxs("div", {
                                  style: {
                                    display: resolveAssets("flex"),
                                    alignItems: resolveAssets("center"),
                                    justifyContent: resolveAssets("space-between"),
                                    marginBottom: resolveAssets("20px"),
                                  },
                                  children: [
                                    jsxs("span", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        fontWeight: resolveAssets("500"),
                                        textTransform: resolveAssets("uppercase"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                      },
                                      children: ["Inside the system / ", active.num],
                                    }),
                                    jsx("span", {
                                      style: {
                                        display: resolveAssets("flex"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                      },
                                      children: active.bigIcon,
                                    }),
                                  ],
                                }),
                                jsxs("div", {
                                  children: [
                                    jsx("h3", {
                                      style: {
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("clamp(30px,3vw,36px)"),
                                        fontWeight: resolveAssets("700"),
                                        lineHeight: resolveAssets("1.2"),
                                      },
                                      children: active.name,
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("17px"),
                                        lineHeight: resolveAssets("1.6"),
                                        marginTop: resolveAssets("12px"),
                                        maxWidth: resolveAssets("580px"),
                                      },
                                      children: active.description,
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("13px"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                        marginTop: resolveAssets("12px"),
                                        lineHeight: resolveAssets("1.8"),
                                        maxWidth: resolveAssets("500px"),
                                      },
                                      children: active.detail,
                                    }),
                                  ],
                                }),
                                jsx("img", {
                                  key: active.name,
                                  src: asset(active.image),
                                  alt: active.imageAlt,
                                  style: {
                                    display: resolveAssets("block"),
                                    width: resolveAssets("100%"),
                                    height: resolveAssets("260px"),
                                    marginTop: resolveAssets("22px"),
                                    objectFit: resolveAssets("contain"),
                                    objectPosition: resolveAssets("center top"),
                                    background: resolveAssets("oklch(0.09 0.01 235)"),
                                    border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                  },
                                }),
                                jsx("ul", {
                                  style: {
                                    display: resolveAssets("flex"),
                                    flexWrap: resolveAssets("wrap"),
                                    gap: resolveAssets("12px 28px"),
                                    listStyle: resolveAssets("none"),
                                    padding: resolveAssets("22px 0"),
                                    margin: resolveAssets("22px 0"),
                                    borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                    borderBottom: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                  },
                                  children: (active.topics || []).map((t2, index) =>
                                    jsx(
                                      React.Fragment,
                                      {
                                        children: jsxs("li", {
                                          style: {
                                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                            textTransform: resolveAssets("uppercase"),
                                            fontSize: resolveAssets("12px"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                          },
                                          children: [
                                            jsx("span", {
                                              style: { color: resolveAssets("oklch(0.72 0.018 225)") },
                                              children: "\u2014 ",
                                            }),
                                            t2,
                                          ],
                                        }),
                                      },
                                      index,
                                    ),
                                  ),
                                }),
                                jsxs("div", {
                                  style: {
                                    display: resolveAssets("flex"),
                                    gap: resolveAssets("12px"),
                                    flexWrap: resolveAssets("wrap"),
                                    alignItems: resolveAssets("center"),
                                    justifyContent: resolveAssets("space-between"),
                                    marginTop: resolveAssets("auto"),
                                  },
                                  children: [
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("12px"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                      },
                                      children: active.prompt,
                                    }),
                                    jsxs("a", {
                                      href: resolveAssets("#system"),
                                      style: {
                                        display: resolveAssets("inline-flex"),
                                        alignItems: resolveAssets("center"),
                                        gap: resolveAssets("6px"),
                                        minHeight: resolveAssets("44px"),
                                        fontSize: resolveAssets("12px"),
                                        fontWeight: resolveAssets("500"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                      },
                                      className: "ported-hover-22",
                                      children: [
                                        "See the dashboard ",
                                        jsxs("svg", {
                                          width: "16",
                                          height: "16",
                                          viewBox: "0 0 24 24",
                                          fill: "none",
                                          stroke: "currentColor",
                                          strokeWidth: "2",
                                          strokeLinecap: "round",
                                          strokeLinejoin: "round",
                                          children: [
                                            jsx("path", { d: "M7 7h10v10" }),
                                            jsx("path", { d: "M7 17 17 7" }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "mobile",
                    "data-screen-label": "Mobile previews",
                    style: {
                      display: resolveAssets("none"),
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("88px 0"),
                      background: resolveAssets("oklch(0.17 0.012 230 / 0.3)"),
                      scrollMarginTop: resolveAssets("96px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: {
                            display: resolveAssets("flex"),
                            flexWrap: resolveAssets("wrap"),
                            justifyContent: resolveAssets("space-between"),
                            alignItems: resolveAssets("flex-end"),
                            gap: resolveAssets("22px 48px"),
                            marginBottom: resolveAssets("40px"),
                          },
                          children: [
                            jsxs("div", {
                              style: { flex: resolveAssets("1 1 420px") },
                              children: [
                                jsx("p", {
                                  style: {
                                    fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                    fontSize: resolveAssets("12px"),
                                    fontWeight: resolveAssets("500"),
                                    lineHeight: resolveAssets("1.8"),
                                    textTransform: resolveAssets("uppercase"),
                                    color: resolveAssets("oklch(0.82 0.14 205)"),
                                  },
                                  children: "Mobile \xB7 original artwork",
                                }),
                                jsxs("h2", {
                                  style: {
                                    marginTop: resolveAssets("18px"),
                                    fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                    fontSize: resolveAssets("clamp(33px,3.6vw,44px)"),
                                    fontWeight: resolveAssets("700"),
                                    lineHeight: resolveAssets("1.15"),
                                  },
                                  children: [
                                    "Evolution OS",
                                    jsx("br", {}),
                                    jsx("span", {
                                      style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                      children: "on mobile.",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            jsx("p", {
                              style: {
                                flex: resolveAssets("0 1 460px"),
                                fontSize: resolveAssets("14px"),
                                lineHeight: resolveAssets("1.85"),
                                color: resolveAssets("oklch(0.72 0.018 225)"),
                                textWrap: resolveAssets("pretty"),
                              },
                              children:
                                "Original mobile interface artwork with illustrative sample content. This is not a live connected session. Dates, figures and project targets pictured are examples, not actual results or launch commitments.",
                            }),
                          ],
                        }),
                        jsxs("div", {
                          className: "lp-ph",
                          style: {
                            display: resolveAssets("grid"),
                            gap: resolveAssets("56px 32px"),
                            alignItems: resolveAssets("start"),
                          },
                          children: [
                            jsxs("figure", {
                              style: {
                                margin: resolveAssets("0"),
                                minWidth: resolveAssets("0"),
                                width: resolveAssets("100%"),
                                maxWidth: resolveAssets("440px"),
                                justifySelf: resolveAssets("center"),
                                display: resolveAssets("flex"),
                                flexDirection: resolveAssets("column"),
                                gap: resolveAssets("16px"),
                              },
                              children: [
                                jsx("button", {
                                  type: "button",
                                  onClick: open0,
                                  "aria-label": "Enlarge Home mobile preview",
                                  style: {
                                    display: resolveAssets("block"),
                                    width: resolveAssets("100%"),
                                    padding: resolveAssets("0"),
                                    border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                    borderRadius: resolveAssets("6px"),
                                    overflow: resolveAssets("hidden"),
                                    background: resolveAssets("oklch(0.07 0.005 230)"),
                                    cursor: resolveAssets("zoom-in"),
                                  },
                                  children: jsx("img", {
                                    src: asset("assets/mobile-home.jpeg"),
                                    width: "1290",
                                    height: "2573",
                                    alt: "Evolution OS mobile Home screen with sample content: seven system icons for Nutrition, Fitness, Wealth, Investing, Journal, Business and Focus around a bonsai hub, a Focus timer set to 25:00 Deep Work, and Home, Stats, Tasks and Profile navigation",
                                    loading: "lazy",
                                    style: {
                                      display: resolveAssets("block"),
                                      width: resolveAssets("100%"),
                                      height: resolveAssets("auto"),
                                      objectFit: resolveAssets("contain"),
                                    },
                                  }),
                                }),
                                jsxs("figcaption", {
                                  children: [
                                    jsx("h3", {
                                      style: {
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("20px"),
                                        fontWeight: resolveAssets("700"),
                                      },
                                      children: "Home",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        textTransform: resolveAssets("uppercase"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Original mobile preview \xB7 sample content",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("13px"),
                                        lineHeight: resolveAssets("1.7"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "The seven systems around the bonsai hub, with the Focus timer below.",
                                    }),
                                    jsxs("div", {
                                      style: {
                                        display: resolveAssets("flex"),
                                        flexWrap: resolveAssets("wrap"),
                                        gap: resolveAssets("4px 16px"),
                                        alignItems: resolveAssets("center"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: [
                                        jsx("button", {
                                          type: "button",
                                          onClick: open0,
                                          "aria-label": "Enlarge Home mobile preview",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("8px"),
                                            minHeight: resolveAssets("44px"),
                                            padding: resolveAssets("0 14px"),
                                            border: resolveAssets("1px solid oklch(0.82 0.14 205)"),
                                            borderRadius: resolveAssets("6px"),
                                            background: resolveAssets("oklch(0.82 0.14 205 / 0.12)"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                            fontSize: resolveAssets("12px"),
                                            textTransform: resolveAssets("uppercase"),
                                            cursor: resolveAssets("pointer"),
                                          },
                                          className: "ported-hover-27",
                                          children: "Enlarge",
                                        }),
                                        jsxs("a", {
                                          href: resolveAssets("assets/mobile-home.jpeg"),
                                          target: "_blank",
                                          rel: "noreferrer",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("6px"),
                                            minHeight: resolveAssets("44px"),
                                            fontSize: resolveAssets("13px"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                          },
                                          children: [
                                            "Original image ",
                                            jsxs("svg", {
                                              width: "14",
                                              height: "14",
                                              viewBox: "0 0 24 24",
                                              fill: "none",
                                              stroke: "currentColor",
                                              strokeWidth: "2",
                                              strokeLinecap: "round",
                                              strokeLinejoin: "round",
                                              "aria-hidden": "true",
                                              children: [
                                                jsx("path", { d: "M7 7h10v10" }),
                                                jsx("path", { d: "M7 17 17 7" }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            jsxs("figure", {
                              style: {
                                margin: resolveAssets("0"),
                                minWidth: resolveAssets("0"),
                                width: resolveAssets("100%"),
                                maxWidth: resolveAssets("440px"),
                                justifySelf: resolveAssets("center"),
                                display: resolveAssets("flex"),
                                flexDirection: resolveAssets("column"),
                                gap: resolveAssets("16px"),
                              },
                              children: [
                                jsx("button", {
                                  type: "button",
                                  onClick: open1,
                                  "aria-label": "Enlarge Tasks & Habits mobile preview",
                                  style: {
                                    display: resolveAssets("block"),
                                    width: resolveAssets("100%"),
                                    padding: resolveAssets("0"),
                                    border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                    borderRadius: resolveAssets("6px"),
                                    overflow: resolveAssets("hidden"),
                                    background: resolveAssets("oklch(0.07 0.005 230)"),
                                    cursor: resolveAssets("zoom-in"),
                                  },
                                  children: jsx("img", {
                                    src: asset("assets/mobile-tasks.png"),
                                    width: "834",
                                    height: "1663",
                                    alt: "Evolution OS mobile Tasks screen with sample content: a weekly check-in row, daily habits at 5 of 8 complete, a list of today\u2019s tasks including Morning Meditation and Workout - Push Day, and quick actions",
                                    loading: "lazy",
                                    style: {
                                      display: resolveAssets("block"),
                                      width: resolveAssets("100%"),
                                      height: resolveAssets("auto"),
                                      objectFit: resolveAssets("contain"),
                                    },
                                  }),
                                }),
                                jsxs("figcaption", {
                                  children: [
                                    jsx("h3", {
                                      style: {
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("20px"),
                                        fontWeight: resolveAssets("700"),
                                      },
                                      children: "Tasks & Habits",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        textTransform: resolveAssets("uppercase"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Original mobile preview \xB7 sample content",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("13px"),
                                        lineHeight: resolveAssets("1.7"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Daily habits, today\u2019s tasks and quick actions.",
                                    }),
                                    jsxs("div", {
                                      style: {
                                        display: resolveAssets("flex"),
                                        flexWrap: resolveAssets("wrap"),
                                        gap: resolveAssets("4px 16px"),
                                        alignItems: resolveAssets("center"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: [
                                        jsx("button", {
                                          type: "button",
                                          onClick: open1,
                                          "aria-label": "Enlarge Tasks & Habits mobile preview",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("8px"),
                                            minHeight: resolveAssets("44px"),
                                            padding: resolveAssets("0 14px"),
                                            border: resolveAssets("1px solid oklch(0.82 0.14 205)"),
                                            borderRadius: resolveAssets("6px"),
                                            background: resolveAssets("oklch(0.82 0.14 205 / 0.12)"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                            fontSize: resolveAssets("12px"),
                                            textTransform: resolveAssets("uppercase"),
                                            cursor: resolveAssets("pointer"),
                                          },
                                          className: "ported-hover-28",
                                          children: "Enlarge",
                                        }),
                                        jsxs("a", {
                                          href: resolveAssets("assets/mobile-tasks.png"),
                                          target: "_blank",
                                          rel: "noreferrer",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("6px"),
                                            minHeight: resolveAssets("44px"),
                                            fontSize: resolveAssets("13px"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                          },
                                          children: [
                                            "Original image ",
                                            jsxs("svg", {
                                              width: "14",
                                              height: "14",
                                              viewBox: "0 0 24 24",
                                              fill: "none",
                                              stroke: "currentColor",
                                              strokeWidth: "2",
                                              strokeLinecap: "round",
                                              strokeLinejoin: "round",
                                              "aria-hidden": "true",
                                              children: [
                                                jsx("path", { d: "M7 7h10v10" }),
                                                jsx("path", { d: "M7 17 17 7" }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            jsxs("figure", {
                              style: {
                                margin: resolveAssets("0"),
                                minWidth: resolveAssets("0"),
                                width: resolveAssets("100%"),
                                maxWidth: resolveAssets("440px"),
                                justifySelf: resolveAssets("center"),
                                display: resolveAssets("flex"),
                                flexDirection: resolveAssets("column"),
                                gap: resolveAssets("16px"),
                              },
                              children: [
                                jsx("button", {
                                  type: "button",
                                  onClick: open2,
                                  "aria-label": "Enlarge Stats mobile preview",
                                  style: {
                                    display: resolveAssets("block"),
                                    width: resolveAssets("100%"),
                                    padding: resolveAssets("0"),
                                    border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                    borderRadius: resolveAssets("6px"),
                                    overflow: resolveAssets("hidden"),
                                    background: resolveAssets("oklch(0.07 0.005 230)"),
                                    cursor: resolveAssets("zoom-in"),
                                  },
                                  children: jsx("img", {
                                    src: asset("assets/mobile-stats.png"),
                                    width: "1161",
                                    height: "2316",
                                    alt: "Evolution OS mobile Stats overview with sample content: overall score 87 percent, tasks completed, focus time, habit consistency and current streak cards, a seven-day productivity trend, time breakdown, task completion and top areas",
                                    loading: "lazy",
                                    style: {
                                      display: resolveAssets("block"),
                                      width: resolveAssets("100%"),
                                      height: resolveAssets("auto"),
                                      objectFit: resolveAssets("contain"),
                                    },
                                  }),
                                }),
                                jsxs("figcaption", {
                                  children: [
                                    jsx("h3", {
                                      style: {
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("20px"),
                                        fontWeight: resolveAssets("700"),
                                      },
                                      children: "Stats",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        textTransform: resolveAssets("uppercase"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Original mobile preview \xB7 sample content",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("13px"),
                                        lineHeight: resolveAssets("1.7"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Overall score, productivity trend and time breakdown.",
                                    }),
                                    jsxs("div", {
                                      style: {
                                        display: resolveAssets("flex"),
                                        flexWrap: resolveAssets("wrap"),
                                        gap: resolveAssets("4px 16px"),
                                        alignItems: resolveAssets("center"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: [
                                        jsx("button", {
                                          type: "button",
                                          onClick: open2,
                                          "aria-label": "Enlarge Stats mobile preview",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("8px"),
                                            minHeight: resolveAssets("44px"),
                                            padding: resolveAssets("0 14px"),
                                            border: resolveAssets("1px solid oklch(0.82 0.14 205)"),
                                            borderRadius: resolveAssets("6px"),
                                            background: resolveAssets("oklch(0.82 0.14 205 / 0.12)"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                            fontSize: resolveAssets("12px"),
                                            textTransform: resolveAssets("uppercase"),
                                            cursor: resolveAssets("pointer"),
                                          },
                                          className: "ported-hover-29",
                                          children: "Enlarge",
                                        }),
                                        jsxs("a", {
                                          href: resolveAssets("assets/mobile-stats.png"),
                                          target: "_blank",
                                          rel: "noreferrer",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("6px"),
                                            minHeight: resolveAssets("44px"),
                                            fontSize: resolveAssets("13px"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                          },
                                          children: [
                                            "Original image ",
                                            jsxs("svg", {
                                              width: "14",
                                              height: "14",
                                              viewBox: "0 0 24 24",
                                              fill: "none",
                                              stroke: "currentColor",
                                              strokeWidth: "2",
                                              strokeLinecap: "round",
                                              strokeLinejoin: "round",
                                              "aria-hidden": "true",
                                              children: [
                                                jsx("path", { d: "M7 7h10v10" }),
                                                jsx("path", { d: "M7 17 17 7" }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            jsxs("figure", {
                              style: {
                                margin: resolveAssets("0"),
                                minWidth: resolveAssets("0"),
                                width: resolveAssets("100%"),
                                maxWidth: resolveAssets("440px"),
                                justifySelf: resolveAssets("center"),
                                display: resolveAssets("flex"),
                                flexDirection: resolveAssets("column"),
                                gap: resolveAssets("16px"),
                              },
                              children: [
                                jsx("button", {
                                  type: "button",
                                  onClick: open3,
                                  "aria-label": "Enlarge Business / Projects mobile preview",
                                  style: {
                                    display: resolveAssets("block"),
                                    width: resolveAssets("100%"),
                                    padding: resolveAssets("0"),
                                    border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                    borderRadius: resolveAssets("6px"),
                                    overflow: resolveAssets("hidden"),
                                    background: resolveAssets("oklch(0.07 0.005 230)"),
                                    cursor: resolveAssets("zoom-in"),
                                  },
                                  children: jsx("img", {
                                    src: asset("assets/mobile-business.png"),
                                    width: "1290",
                                    height: "2796",
                                    alt: "Evolution OS mobile Business Projects screen with sample content: five projects with progress bars and target dates, quick actions, today\u2019s focus, business metrics and project health",
                                    loading: "lazy",
                                    style: {
                                      display: resolveAssets("block"),
                                      width: resolveAssets("100%"),
                                      height: resolveAssets("auto"),
                                      objectFit: resolveAssets("contain"),
                                    },
                                  }),
                                }),
                                jsxs("figcaption", {
                                  children: [
                                    jsx("h3", {
                                      style: {
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("20px"),
                                        fontWeight: resolveAssets("700"),
                                      },
                                      children: "Business / Projects",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        textTransform: resolveAssets("uppercase"),
                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Original mobile preview \xB7 sample content",
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("13px"),
                                        lineHeight: resolveAssets("1.7"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: "Projects with progress, targets, quick actions and business metrics.",
                                    }),
                                    jsxs("div", {
                                      style: {
                                        display: resolveAssets("flex"),
                                        flexWrap: resolveAssets("wrap"),
                                        gap: resolveAssets("4px 16px"),
                                        alignItems: resolveAssets("center"),
                                        marginTop: resolveAssets("6px"),
                                      },
                                      children: [
                                        jsx("button", {
                                          type: "button",
                                          onClick: open3,
                                          "aria-label": "Enlarge Business / Projects mobile preview",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("8px"),
                                            minHeight: resolveAssets("44px"),
                                            padding: resolveAssets("0 14px"),
                                            border: resolveAssets("1px solid oklch(0.82 0.14 205)"),
                                            borderRadius: resolveAssets("6px"),
                                            background: resolveAssets("oklch(0.82 0.14 205 / 0.12)"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                            fontSize: resolveAssets("12px"),
                                            textTransform: resolveAssets("uppercase"),
                                            cursor: resolveAssets("pointer"),
                                          },
                                          className: "ported-hover-30",
                                          children: "Enlarge",
                                        }),
                                        jsxs("a", {
                                          href: resolveAssets("assets/mobile-business.png"),
                                          target: "_blank",
                                          rel: "noreferrer",
                                          style: {
                                            display: resolveAssets("inline-flex"),
                                            alignItems: resolveAssets("center"),
                                            gap: resolveAssets("6px"),
                                            minHeight: resolveAssets("44px"),
                                            fontSize: resolveAssets("13px"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                          },
                                          children: [
                                            "Original image ",
                                            jsxs("svg", {
                                              width: "14",
                                              height: "14",
                                              viewBox: "0 0 24 24",
                                              fill: "none",
                                              stroke: "currentColor",
                                              strokeWidth: "2",
                                              strokeLinecap: "round",
                                              strokeLinejoin: "round",
                                              "aria-hidden": "true",
                                              children: [
                                                jsx("path", { d: "M7 7h10v10" }),
                                                jsx("path", { d: "M7 17 17 7" }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "workflow",
                    "data-screen-label": "Deep work",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("88px 0"),
                      scrollMarginTop: resolveAssets("96px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: {
                            display: resolveAssets("flex"),
                            flexWrap: resolveAssets("wrap"),
                            gap: resolveAssets("30px clamp(32px,5.5vw,80px)"),
                            alignItems: resolveAssets("stretch"),
                          },
                          children: [
                            jsxs("div", {
                              style: { flex: resolveAssets("1 1 420px"), minWidth: resolveAssets("0") },
                              children: [
                                jsx("p", {
                                  style: {
                                    fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                    fontSize: resolveAssets("12px"),
                                    fontWeight: resolveAssets("500"),
                                    lineHeight: resolveAssets("1.8"),
                                    textTransform: resolveAssets("uppercase"),
                                    color: resolveAssets("oklch(0.82 0.14 205)"),
                                  },
                                  children: "Capture \u2192 Focus \u2192 Review",
                                }),
                                jsxs("h2", {
                                  style: {
                                    marginTop: resolveAssets("18px"),
                                    fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                    fontSize: resolveAssets("clamp(33px,3.6vw,44px)"),
                                    fontWeight: resolveAssets("700"),
                                    lineHeight: resolveAssets("1.15"),
                                  },
                                  children: [
                                    "Built for",
                                    jsx("br", {}),
                                    jsx("span", {
                                      style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                      children: "deep work.",
                                    }),
                                  ],
                                }),
                                jsx("p", {
                                  style: {
                                    marginTop: resolveAssets("24px"),
                                    fontSize: resolveAssets("14px"),
                                    lineHeight: resolveAssets("1.9"),
                                    color: resolveAssets("oklch(0.72 0.018 225)"),
                                    maxWidth: resolveAssets("480px"),
                                    textWrap: resolveAssets("pretty"),
                                  },
                                  children:
                                    "Most people have notes scattered across apps, goals stored in their head, and no system connecting their actions to their outcomes.",
                                }),
                                jsxs("p", {
                                  style: {
                                    fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                    fontSize: resolveAssets("18px"),
                                    lineHeight: resolveAssets("1.7"),
                                    marginTop: resolveAssets("22px"),
                                  },
                                  children: [
                                    "Evolution unifies everything.",
                                    jsx("br", {}),
                                    jsx("span", {
                                      style: { color: resolveAssets("oklch(0.72 0.018 225)") },
                                      children: "One system. One source of truth.",
                                    }),
                                  ],
                                }),
                                jsx("ol", {
                                  style: {
                                    margin: resolveAssets("32px 0 0"),
                                    padding: resolveAssets("0"),
                                    listStyle: resolveAssets("none"),
                                  },
                                  children: (flow || []).map((f2, index) =>
                                    jsx(
                                      React.Fragment,
                                      {
                                        children: jsxs("li", {
                                          style: {
                                            display: resolveAssets("grid"),
                                            gridTemplateColumns: resolveAssets("38px minmax(0,1fr)"),
                                            gap: resolveAssets("18px"),
                                            padding: resolveAssets("20px 0"),
                                            borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                          },
                                          children: [
                                            jsx("div", {
                                              style: {
                                                display: resolveAssets("grid"),
                                                placeItems: resolveAssets("center"),
                                                width: resolveAssets("38px"),
                                                height: resolveAssets("38px"),
                                                boxSizing: resolveAssets("border-box"),
                                                border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                                borderRadius: resolveAssets("4px"),
                                                color: resolveAssets("oklch(0.82 0.14 205)"),
                                              },
                                              children: f2.icon,
                                            }),
                                            jsxs("div", {
                                              children: [
                                                jsxs("p", {
                                                  style: {
                                                    fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                                    fontSize: resolveAssets("12px"),
                                                    fontWeight: resolveAssets("500"),
                                                    lineHeight: resolveAssets("1.8"),
                                                    textTransform: resolveAssets("uppercase"),
                                                    color: resolveAssets("oklch(0.82 0.14 205)"),
                                                  },
                                                  children: [f2.step, " / ", f2.title],
                                                }),
                                                jsx("p", {
                                                  style: {
                                                    fontSize: resolveAssets("12px"),
                                                    color: resolveAssets("oklch(0.72 0.018 225)"),
                                                    lineHeight: resolveAssets("1.9"),
                                                    marginTop: resolveAssets("7px"),
                                                  },
                                                  children: f2.text,
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      },
                                      index,
                                    ),
                                  ),
                                }),
                              ],
                            }),
                            jsxs("div", {
                              style: {
                                position: resolveAssets("relative"),
                                isolation: resolveAssets("isolate"),
                                flex: resolveAssets("1 1 420px"),
                                minHeight: resolveAssets("clamp(400px,45vw,620px)"),
                                overflow: resolveAssets("hidden"),
                              },
                              children: [
                                jsx("img", {
                                  src: asset("assets/mountain-bg.png"),
                                  alt: "A mountain ridge rising into a dark sky",
                                  loading: "lazy",
                                  style: {
                                    position: resolveAssets("absolute"),
                                    inset: resolveAssets("0"),
                                    width: resolveAssets("100%"),
                                    height: resolveAssets("100%"),
                                    objectFit: resolveAssets("cover"),
                                    objectPosition: resolveAssets("52% center"),
                                  },
                                }),
                                jsx("div", {
                                  style: {
                                    position: resolveAssets("absolute"),
                                    inset: resolveAssets("0"),
                                    zIndex: resolveAssets("1"),
                                    background: resolveAssets(
                                      "linear-gradient(0deg, oklch(0.125 0.009 240), transparent 70%)",
                                    ),
                                  },
                                }),
                                jsxs("div", {
                                  style: {
                                    position: resolveAssets("absolute"),
                                    zIndex: resolveAssets("2"),
                                    bottom: resolveAssets("35px"),
                                    left: resolveAssets("30px"),
                                    right: resolveAssets("25px"),
                                  },
                                  children: [
                                    jsx("span", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        fontWeight: resolveAssets("500"),
                                        textTransform: resolveAssets("uppercase"),
                                        color: resolveAssets("oklch(0.72 0.018 225)"),
                                      },
                                      children: "Growing today. Building forever.",
                                    }),
                                    jsxs("p", {
                                      style: {
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("clamp(17px,1.6vw,21px)"),
                                        lineHeight: resolveAssets("1.65"),
                                        marginTop: resolveAssets("18px"),
                                      },
                                      children: [
                                        "Your notes fuel your focus.",
                                        jsx("br", {}),
                                        "Your focus drives your actions.",
                                        jsx("br", {}),
                                        jsx("span", {
                                          style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                          children: "Your actions build your future.",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        jsxs("div", {
                          style: {
                            display: resolveAssets("flex"),
                            flexWrap: resolveAssets("wrap"),
                            gap: resolveAssets("16px 48px"),
                            paddingTop: resolveAssets("34px"),
                            marginTop: resolveAssets("40px"),
                            borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                          },
                          children: [
                            jsx("span", {
                              style: {
                                flex: resolveAssets("0 0 230px"),
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                fontWeight: resolveAssets("500"),
                                lineHeight: resolveAssets("1.8"),
                                textTransform: resolveAssets("uppercase"),
                                color: resolveAssets("oklch(0.82 0.14 205)"),
                              },
                              children: "The intent is simple",
                            }),
                            jsxs("p", {
                              style: {
                                flex: resolveAssets("1 1 360px"),
                                fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                fontSize: resolveAssets("clamp(16px,1.3vw,18px)"),
                                lineHeight: resolveAssets("1.65"),
                              },
                              children: [
                                "Every thought becomes a task. Every task becomes action.",
                                jsx("br", {}),
                                "Every action becomes an opportunity to review your progress.",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "access",
                    "data-screen-label": "Access",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("88px 0"),
                      background: resolveAssets(
                        "linear-gradient(130deg, oklch(0.17 0.012 230 / 0.35), oklch(0.125 0.009 240 / 0.35))",
                      ),
                      scrollMarginTop: resolveAssets("96px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                        display: resolveAssets("flex"),
                        flexWrap: resolveAssets("wrap"),
                        gap: resolveAssets("28px clamp(36px,5.5vw,80px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: { flex: resolveAssets("1.25 1 420px") },
                          children: [
                            jsxs("p", {
                              style: {
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                fontWeight: resolveAssets("500"),
                                lineHeight: resolveAssets("1.8"),
                                textTransform: resolveAssets("uppercase"),
                                color: resolveAssets("oklch(0.82 0.14 205)"),
                                display: resolveAssets("flex"),
                                alignItems: resolveAssets("center"),
                                gap: resolveAssets("10px"),
                              },
                              children: [
                                jsx("span", {
                                  style: {
                                    width: resolveAssets("5px"),
                                    height: resolveAssets("5px"),
                                    borderRadius: resolveAssets("50%"),
                                    background: resolveAssets("oklch(0.78 0.14 172)"),
                                  },
                                }),
                                "Access information",
                              ],
                            }),
                            jsxs("h2", {
                              style: {
                                marginTop: resolveAssets("18px"),
                                fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                fontSize: resolveAssets("clamp(33px,3.6vw,44px)"),
                                fontWeight: resolveAssets("700"),
                                lineHeight: resolveAssets("1.15"),
                              },
                              children: [
                                "An intentional system.",
                                jsx("br", {}),
                                jsx("span", {
                                  style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                  children: "An honest invitation.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        jsxs("div", {
                          style: { flex: resolveAssets("1 1 340px") },
                          children: [
                            jsx("p", {
                              style: {
                                fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                fontSize: resolveAssets("clamp(20px,1.7vw,23px)"),
                                lineHeight: resolveAssets("1.5"),
                              },
                              children: promoSalesCopy.section5,
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("13px"),
                                lineHeight: resolveAssets("1.9"),
                                marginTop: resolveAssets("18px"),
                                color: resolveAssets("oklch(0.72 0.018 225)"),
                                textWrap: resolveAssets("pretty"),
                              },
                              children: promoSalesCopy.section6,
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("13px"),
                                lineHeight: resolveAssets("1.9"),
                                marginTop: resolveAssets("12px"),
                                color: resolveAssets("oklch(0.72 0.018 225)"),
                                textWrap: resolveAssets("pretty"),
                              },
                              children: promoSalesCopy.section7,
                            }),
                            jsxs("a", {
                              href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                              style: {
                                display: resolveAssets("inline-flex"),
                                alignItems: resolveAssets("center"),
                                gap: resolveAssets("8px"),
                                minHeight: resolveAssets("44px"),
                                marginTop: resolveAssets("8px"),
                                fontSize: resolveAssets("13px"),
                                color: resolveAssets("oklch(0.82 0.14 205)"),
                              },
                              className: "ported-hover-31",
                              children: [
                                "Pricing & bundle overview ",
                                jsx("span", { "aria-hidden": "true", children: "\u2197" }),
                              ],
                            }),
                            jsxs("a", {
                              href: resolveAssets("#system"),
                              style: {
                                display: resolveAssets("inline-flex"),
                                alignItems: resolveAssets("center"),
                                gap: resolveAssets("8px"),
                                marginTop: resolveAssets("25px"),
                                minHeight: resolveAssets("48px"),
                                boxSizing: resolveAssets("border-box"),
                                padding: resolveAssets("14px 20px"),
                                borderRadius: resolveAssets("4px"),
                                border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                                color: resolveAssets("oklch(0.965 0.006 220)"),
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                fontWeight: resolveAssets("500"),
                                textTransform: resolveAssets("uppercase"),
                                transition: resolveAssets(
                                  "transform 180ms cubic-bezier(0.2,0.7,0.2,1),background 180ms",
                                ),
                              },
                              className: "ported-hover-32",
                              children: [
                                "Take a closer look ",
                                jsxs("svg", {
                                  width: "16",
                                  height: "16",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: "2",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  children: [jsx("path", { d: "M5 12h14" }), jsx("path", { d: "m12 5 7 7-7 7" })],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "faq",
                    "data-screen-label": "FAQ",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("88px 0"),
                      scrollMarginTop: resolveAssets("96px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                        display: resolveAssets("flex"),
                        flexWrap: resolveAssets("wrap"),
                        gap: resolveAssets("28px clamp(36px,5.5vw,80px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: { flex: resolveAssets("1 1 360px") },
                          children: [
                            jsx("p", {
                              style: {
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                fontWeight: resolveAssets("500"),
                                lineHeight: resolveAssets("1.8"),
                                textTransform: resolveAssets("uppercase"),
                                color: resolveAssets("oklch(0.82 0.14 205)"),
                              },
                              children: "A little clarity",
                            }),
                            jsxs("h2", {
                              style: {
                                marginTop: resolveAssets("18px"),
                                fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                fontSize: resolveAssets("clamp(33px,3.6vw,44px)"),
                                fontWeight: resolveAssets("700"),
                                lineHeight: resolveAssets("1.15"),
                              },
                              children: [
                                "Good questions.",
                                jsx("br", {}),
                                jsx("span", {
                                  style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                                  children: "Straight answers.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        jsx("div", {
                          style: {
                            flex: resolveAssets("1.2 1 420px"),
                            borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                          },
                          children: (faqs || []).map((q2, index) =>
                            jsx(
                              React.Fragment,
                              {
                                children: jsxs("div", {
                                  style: { borderBottom: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)") },
                                  children: [
                                    jsxs("button", {
                                      type: "button",
                                      "aria-expanded": q2.open,
                                      onClick: q2.toggle,
                                      style: {
                                        width: resolveAssets("100%"),
                                        display: resolveAssets("grid"),
                                        gridTemplateColumns: resolveAssets("minmax(0,1fr) 24px"),
                                        alignItems: resolveAssets("center"),
                                        gap: resolveAssets("18px"),
                                        padding: resolveAssets("24px 0"),
                                        minHeight: resolveAssets("72px"),
                                        border: resolveAssets("0"),
                                        background: resolveAssets("none"),
                                        color: resolveAssets("oklch(0.965 0.006 220)"),
                                        fontFamily: resolveAssets("Inter,sans-serif"),
                                        fontSize: resolveAssets("14px"),
                                        lineHeight: resolveAssets("1.6"),
                                        textAlign: resolveAssets("left"),
                                        cursor: resolveAssets("pointer"),
                                      },
                                      className: "ported-hover-33",
                                      children: [
                                        jsx("span", { children: q2.question }),
                                        jsx("span", {
                                          "aria-hidden": "true",
                                          style: {
                                            fontSize: resolveAssets("24px"),
                                            fontWeight: resolveAssets("300"),
                                            color: resolveAssets("oklch(0.82 0.14 205)"),
                                            textAlign: resolveAssets("center"),
                                            transform: resolveAssets(q2.plusRot),
                                            transition: resolveAssets("transform 200ms"),
                                          },
                                          children: "+",
                                        }),
                                      ],
                                    }),
                                    q2.open
                                      ? jsx(Fragment, {
                                          children: jsxs("div", {
                                            style: {
                                              fontSize: resolveAssets("13px"),
                                              lineHeight: resolveAssets("1.9"),
                                              color: resolveAssets("oklch(0.72 0.018 225)"),
                                              padding: resolveAssets("0 40px 24px 0"),
                                            },
                                            children: [
                                              jsx("p", { children: q2.answer }),
                                              q2.hasLink
                                                ? jsx(Fragment, {
                                                    children: jsxs("a", {
                                                      href: resolveAssets("#access"),
                                                      style: {
                                                        display: resolveAssets("inline-flex"),
                                                        minHeight: resolveAssets("44px"),
                                                        alignItems: resolveAssets("center"),
                                                        gap: resolveAssets("8px"),
                                                        marginTop: resolveAssets("8px"),
                                                        color: resolveAssets("oklch(0.82 0.14 205)"),
                                                      },
                                                      children: [
                                                        "View access information ",
                                                        jsx("span", { "aria-hidden": "true", children: "\u2197" }),
                                                      ],
                                                    }),
                                                  })
                                                : null,
                                            ],
                                          }),
                                        })
                                      : null,
                                  ],
                                }),
                              },
                              index,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    "data-screen-label": "Final CTA",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                      padding: resolveAssets("64px 0 80px"),
                      textAlign: resolveAssets("center"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1440px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3.4vw,48px)"),
                      },
                      children: [
                        jsx("img", {
                          src: asset("assets/bonsai-logo.png"),
                          alt: "Evolution OS bonsai logo",
                          style: {
                            display: resolveAssets("block"),
                            width: resolveAssets("95px"),
                            height: resolveAssets("80px"),
                            objectFit: resolveAssets("contain"),
                            margin: resolveAssets("0 auto 22px"),
                          },
                        }),
                        jsx("p", {
                          style: {
                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                            fontSize: resolveAssets("12px"),
                            fontWeight: resolveAssets("500"),
                            lineHeight: resolveAssets("1.8"),
                            textTransform: resolveAssets("uppercase"),
                            color: resolveAssets("oklch(0.82 0.14 205)"),
                          },
                          children: "Evolution OS",
                        }),
                        jsxs("h2", {
                          style: {
                            marginTop: resolveAssets("18px"),
                            fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                            fontSize: resolveAssets("clamp(34px,3.6vw,48px)"),
                            fontWeight: resolveAssets("700"),
                            lineHeight: resolveAssets("1.15"),
                          },
                          children: [
                            "The life you\u2019re building.",
                            jsx("br", {}),
                            jsx("span", {
                              style: { color: resolveAssets("oklch(0.82 0.14 205)") },
                              children: "Bring it into focus.",
                            }),
                          ],
                        }),
                        jsx("p", {
                          style: {
                            fontSize: resolveAssets("13px"),
                            color: resolveAssets("oklch(0.72 0.018 225)"),
                            marginTop: resolveAssets("20px"),
                          },
                          children: "Built for the disciplined few.",
                        }),
                        jsxs("a", {
                          href: resolveAssets("#system"),
                          style: {
                            display: resolveAssets("inline-flex"),
                            alignItems: resolveAssets("center"),
                            gap: resolveAssets("8px"),
                            marginTop: resolveAssets("30px"),
                            minHeight: resolveAssets("48px"),
                            boxSizing: resolveAssets("border-box"),
                            padding: resolveAssets("14px 20px"),
                            borderRadius: resolveAssets("4px"),
                            background: resolveAssets("oklch(0.82 0.14 205)"),
                            color: resolveAssets("oklch(0.14 0.016 225)"),
                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                            fontSize: resolveAssets("12px"),
                            fontWeight: resolveAssets("500"),
                            textTransform: resolveAssets("uppercase"),
                            transition: resolveAssets("transform 180ms cubic-bezier(0.2,0.7,0.2,1)"),
                          },
                          className: "ported-hover-34",
                          children: [
                            "Find your starting point ",
                            jsxs("svg", {
                              width: "16",
                              height: "16",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              children: [jsx("path", { d: "M5 12h14" }), jsx("path", { d: "m12 5 7 7-7 7" })],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              null,
              lightboxOpen
                ? jsx(Fragment, {
                    children: jsx("div", {
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-label": lb.title + " screenshot",
                      onClick: closeLightbox,
                      style: {
                        position: resolveAssets("fixed"),
                        inset: resolveAssets("0"),
                        zIndex: resolveAssets("60"),
                        background: resolveAssets("oklch(0.07 0.007 230 / 0.9)"),
                        display: resolveAssets("grid"),
                        placeItems: resolveAssets("center"),
                        padding: resolveAssets("16px"),
                      },
                      children: jsxs("div", {
                        onClick: stop,
                        style: {
                          position: resolveAssets("relative"),
                          width: resolveAssets("100%"),
                          maxWidth: resolveAssets("1320px"),
                          maxHeight: resolveAssets("92vh"),
                          overflowY: resolveAssets("auto"),
                          boxSizing: resolveAssets("border-box"),
                          padding: resolveAssets("26px"),
                          borderRadius: resolveAssets("6px"),
                          border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                          background: resolveAssets("oklch(0.17 0.012 230)"),
                          display: resolveAssets("grid"),
                          gap: resolveAssets("14px"),
                        },
                        children: [
                          jsx("button", {
                            type: "button",
                            id: "lb-close",
                            onClick: closeLightbox,
                            "aria-label": "Close",
                            style: {
                              position: resolveAssets("absolute"),
                              top: resolveAssets("14px"),
                              right: resolveAssets("14px"),
                              width: resolveAssets("44px"),
                              height: resolveAssets("44px"),
                              display: resolveAssets("grid"),
                              placeItems: resolveAssets("center"),
                              border: resolveAssets("0"),
                              borderRadius: resolveAssets("4px"),
                              background: resolveAssets("transparent"),
                              color: resolveAssets("oklch(0.72 0.018 225)"),
                              cursor: resolveAssets("pointer"),
                            },
                            className: "ported-hover-45",
                            children: jsxs("svg", {
                              width: "18",
                              height: "18",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2",
                              strokeLinecap: "round",
                              children: [jsx("path", { d: "M18 6 6 18" }), jsx("path", { d: "m6 6 12 12" })],
                            }),
                          }),
                          jsxs("h2", {
                            style: {
                              fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                              fontSize: resolveAssets("18px"),
                              fontWeight: resolveAssets("600"),
                              paddingRight: resolveAssets("40px"),
                            },
                            children: [lb.title, " \u2014 Demo preview"],
                          }),
                          jsx("p", {
                            style: { fontSize: resolveAssets("13px"), color: resolveAssets("oklch(0.72 0.018 225)") },
                            children:
                              "Screenshot of the app\u2019s guest interface \xB7 Sample data \xB7 Not a live session.",
                          }),
                          jsx("div", {
                            style: {
                              overflow: resolveAssets("auto"),
                              maxHeight: resolveAssets("65vh"),
                              overscrollBehavior: resolveAssets("contain"),
                            },
                            children: jsx("img", {
                              src: resolveAssets(lb.src),
                              alt: lb.alt,
                              style: {
                                display: resolveAssets("block"),
                                width: resolveAssets("1440px"),
                                maxWidth: resolveAssets("none"),
                                height: resolveAssets("auto"),
                              },
                            }),
                          }),
                          jsxs("a", {
                            href: resolveAssets(lb.src),
                            target: "_blank",
                            rel: "noreferrer",
                            style: {
                              justifySelf: resolveAssets("start"),
                              display: resolveAssets("inline-flex"),
                              alignItems: resolveAssets("center"),
                              gap: resolveAssets("6px"),
                              minHeight: resolveAssets("40px"),
                              fontSize: resolveAssets("13px"),
                              color: resolveAssets("oklch(0.82 0.14 205)"),
                            },
                            className: "ported-hover-46",
                            children: [
                              "Open original image ",
                              jsxs("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                children: [jsx("path", { d: "M7 7h10v10" }), jsx("path", { d: "M7 17 17 7" })],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  })
                : null,
              phoneOpen
                ? jsx(Fragment, {
                    children: jsx("div", {
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-label": lbp.title + " mobile preview",
                      onClick: closeLightbox,
                      style: {
                        position: resolveAssets("fixed"),
                        inset: resolveAssets("0"),
                        zIndex: resolveAssets("60"),
                        background: resolveAssets("oklch(0.07 0.007 230 / 0.9)"),
                        display: resolveAssets("grid"),
                        placeItems: resolveAssets("center"),
                        padding: resolveAssets("16px"),
                      },
                      children: jsxs("div", {
                        onClick: stop,
                        style: {
                          position: resolveAssets("relative"),
                          width: resolveAssets("100%"),
                          maxWidth: resolveAssets("760px"),
                          maxHeight: resolveAssets("92vh"),
                          overflowY: resolveAssets("auto"),
                          boxSizing: resolveAssets("border-box"),
                          padding: resolveAssets("26px"),
                          borderRadius: resolveAssets("6px"),
                          border: resolveAssets("1px solid oklch(0.35 0.019 230 / 0.52)"),
                          background: resolveAssets("oklch(0.17 0.012 230)"),
                          display: resolveAssets("grid"),
                          gap: resolveAssets("14px"),
                        },
                        children: [
                          jsx("button", {
                            type: "button",
                            id: "lb-close",
                            onClick: closeLightbox,
                            "aria-label": "Close",
                            style: {
                              position: resolveAssets("absolute"),
                              top: resolveAssets("14px"),
                              right: resolveAssets("14px"),
                              width: resolveAssets("44px"),
                              height: resolveAssets("44px"),
                              display: resolveAssets("grid"),
                              placeItems: resolveAssets("center"),
                              border: resolveAssets("0"),
                              borderRadius: resolveAssets("4px"),
                              background: resolveAssets("transparent"),
                              color: resolveAssets("oklch(0.72 0.018 225)"),
                              cursor: resolveAssets("pointer"),
                            },
                            className: "ported-hover-47",
                            children: jsxs("svg", {
                              width: "18",
                              height: "18",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2",
                              strokeLinecap: "round",
                              children: [jsx("path", { d: "M18 6 6 18" }), jsx("path", { d: "m6 6 12 12" })],
                            }),
                          }),
                          jsxs("h2", {
                            style: {
                              fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                              fontSize: resolveAssets("18px"),
                              fontWeight: resolveAssets("600"),
                              paddingRight: resolveAssets("48px"),
                            },
                            children: [lbp.title, " \u2014 Original mobile preview"],
                          }),
                          jsx("p", {
                            style: { fontSize: resolveAssets("13px"), color: resolveAssets("oklch(0.72 0.018 225)") },
                            children: "Original mobile artwork \xB7 sample content \xB7 not a live session.",
                          }),
                          jsx("div", {
                            style: {
                              overflow: resolveAssets("auto"),
                              maxHeight: resolveAssets("68vh"),
                              overscrollBehavior: resolveAssets("contain"),
                              textAlign: resolveAssets("center"),
                            },
                            children: jsx("img", {
                              src: resolveAssets(lbp.src),
                              width: lbp.w,
                              height: lbp.h,
                              alt: lbp.alt,
                              style: {
                                display: resolveAssets("block"),
                                width: resolveAssets("100%"),
                                maxWidth: resolveAssets("720px"),
                                height: resolveAssets("auto"),
                                objectFit: resolveAssets("contain"),
                                margin: resolveAssets("0 auto"),
                              },
                            }),
                          }),
                          jsxs("a", {
                            href: resolveAssets(lbp.src),
                            target: "_blank",
                            rel: "noreferrer",
                            style: {
                              justifySelf: resolveAssets("start"),
                              display: resolveAssets("inline-flex"),
                              alignItems: resolveAssets("center"),
                              gap: resolveAssets("6px"),
                              minHeight: resolveAssets("44px"),
                              fontSize: resolveAssets("13px"),
                              color: resolveAssets("oklch(0.82 0.14 205)"),
                            },
                            className: "ported-hover-48",
                            children: [
                              "Open original image ",
                              jsxs("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                "aria-hidden": "true",
                                children: [jsx("path", { d: "M7 7h10v10" }), jsx("path", { d: "M7 17 17 7" })],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  })
                : null,
            ],
          }),
        ],
      });
    }
  }
  return EvolutionPage2;
})();
const ExtremisPage = (() => {
  const TABS = [
    {
      id: "journal",
      name: "Journal",
      title: "Trade journal",
      text: "Record each trade with its setup, a checklist, notes and a review. This is a feature overview; the fields are empty.",
      rows: [
        { a: "SETUP", b: "Which setup the trade belongs to", c: "\u2014" },
        { a: "CHECKLIST", b: "Confirmations before entry", c: "\u2014" },
        { a: "NOTES", b: "Context and reasoning", c: "\u2014" },
        { a: "REVIEW", b: "Review after the trade", c: "\u2014" },
      ],
    },
    {
      id: "strategies",
      name: "Strategies",
      title: "Strategy lab",
      text: "Define setups and keep their checklists, notes and reviews together. This is a feature overview; the fields are empty.",
      rows: [
        { a: "SETUP", b: "Name and describe a setup", c: "\u2014" },
        { a: "CHECKLIST", b: "List the rules for the setup", c: "\u2014" },
        { a: "NOTES", b: "Observations for the setup", c: "\u2014" },
        { a: "REVIEW", b: "Compare reviews across setups", c: "\u2014" },
      ],
    },
    {
      id: "analytics",
      name: "Analytics",
      title: "Strategy analytics",
      text: "Break results down by strategy and period. This is a feature overview; results are unavailable in the preview.",
      rows: [
        { a: "SETUP", b: "Breakdown by strategy", c: "\u2014" },
        { a: "PERIOD", b: "Choose a time range", c: "\u2014" },
        { a: "RESULTS", b: "Unavailable in this preview", c: "\u2014" },
        { a: "REVIEW", b: "Compare periods", c: "\u2014" },
      ],
    },
  ];
  const OVERVIEW = [
    ["01", "Performance", "Total P&L, win rate, profit factor, average R:R and trade count in one panel."],
    ["02", "Trade log", "A running list of trades with symbol, side, entry, exit, P&L and R."],
    ["03", "Strategy analytics", "Win rate and trade breakdowns by strategy and time period."],
    ["04", "Market overview", "A watchlist panel by group: futures, forex, indices and commodities."],
  ];
  const FAQS = [
    [
      "What is Extremis OS?",
      "A trading operating system from Evolution Co. This page shows a design preview of its desktop home, plus feature-overview previews of Journal, Strategies and Analytics.",
    ],
    [
      "Does it connect to a broker or a market feed?",
      "No connection is shown or claimed. The current interface is a design preview, with no live market feed, broker connection, trade execution or replay.",
    ],
    [
      "Are the numbers real?",
      "No. Every figure in the dashboard artwork is illustrative sample data and does not represent verified results. The Journal, Strategies and Analytics previews show no data.",
    ],
    ["How can I get access, and what will it cost?", promoSalesCopy.section8],
  ];
  class ExtremisPage2 extends React.Component {
    state = { tab: 0, faq: -1 };
    keyTab(ev, i) {
      const n = TABS.length;
      let j = null;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") j = (i + 1) % n;
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") j = (i - 1 + n) % n;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = n - 1;
      if (j === null) return;
      ev.preventDefault();
      this.setState({ tab: j }, () => {
        const el = document.getElementById("tab-" + TABS[j].id);
        if (el) el.focus();
      });
    }
    renderVals() {
      const { tab, faq } = this.state;
      const R = "oklch(0.74 0.17 27)";
      return {
        year: new Date().getFullYear(),
        overview: OVERVIEW.map(([n, title, text]) => ({ n, title, text })),
        tabs: TABS.map((t, i) => ({
          tab: i === tab ? 0 : -1,
          onKey: (ev) => this.keyTab(ev, i),
          id: t.id,
          name: t.name,
          selected: i === tab ? "true" : "false",
          line: i === tab ? "oklch(0.6 0.23 27)" : "transparent",
          bg: i === tab ? "oklch(0.19 0.012 240)" : "transparent",
          color: i === tab ? R : "oklch(0.965 0.006 220)",
          onClick: () => this.setState({ tab: i }),
        })),
        p: { ...TABS[tab], rows: TABS[tab].rows.map((r) => ({ bar: "", ...r })) },
        faqs: FAQS.map(([question, answer], i) => ({
          question,
          answer,
          open: faq === i,
          rot: faq === i ? "rotate(45deg)" : "none",
          toggle: () => this.setState({ faq: faq === i ? -1 : i }),
        })),
      };
    }
    render() {
      const _renderData = this.renderVals();
      const {
        a,
        answer,
        b,
        bar,
        bg,
        c,
        color,
        faqs,
        id,
        line,
        n,
        name,
        o,
        onClick,
        onKey,
        open,
        overview,
        p,
        q,
        question,
        r,
        rot,
        rows,
        selected,
        t,
        tab,
        tabs,
        text,
        title,
        toggle,
        year,
      } = _renderData;
      return jsxs(Fragment, {
        children: [
          jsx("style", {
            children: resolveAssets(
              "\nhtml{scroll-behavior:smooth;scroll-padding-top:24px}\nbody{margin:0;background:oklch(0.13 0.006 240);color:oklch(0.965 0.006 220);font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\nh1,h2,h3,p{margin:0}\na{color:oklch(0.74 0.17 27);text-decoration:none}\na:hover{color:oklch(0.74 0.17 27)}\na:focus-visible,button:focus-visible{outline:3px solid oklch(0.74 0.17 27);outline-offset:3px;border-radius:2px}\n::selection{background:oklch(0.6 0.23 27);color:oklch(0.13 0.006 240)}\n@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;scroll-behavior:auto!important}}\n",
            ),
          }),
          jsxs("div", {
            style: {
              position: resolveAssets("relative"),
              isolation: resolveAssets("isolate"),
              overflow: resolveAssets("clip"),
              minHeight: resolveAssets("100vh"),
              background: resolveAssets("oklch(0.13 0.006 240)"),
            },
            children: [
              jsx("div", {
                "aria-hidden": "true",
                style: {
                  position: resolveAssets("absolute"),
                  inset: resolveAssets("0"),
                  zIndex: resolveAssets("-1"),
                  pointerEvents: resolveAssets("none"),
                  backgroundColor: resolveAssets("oklch(0.6 0.23 27 / 0.14)"),
                  WebkitMaskImage: resolveAssets("url(assets/circuit-board.svg)"),
                  maskImage: resolveAssets("url(assets/circuit-board.svg)"),
                  WebkitMaskSize: resolveAssets("1368px 1520px"),
                  maskSize: resolveAssets("1368px 1520px"),
                  WebkitMaskRepeat: resolveAssets("repeat"),
                  maskRepeat: resolveAssets("repeat"),
                },
              }),
              jsx("header", {
                "data-screen-label": "Header",
                style: {
                  maxWidth: resolveAssets("1240px"),
                  margin: resolveAssets("0 auto"),
                  padding: resolveAssets("0 clamp(20px,3vw,40px)"),
                },
                children: jsxs("div", {
                  style: {
                    display: resolveAssets("flex"),
                    alignItems: resolveAssets("center"),
                    flexWrap: resolveAssets("wrap"),
                    gap: resolveAssets("6px clamp(20px,3vw,44px)"),
                    minHeight: resolveAssets("76px"),
                    padding: resolveAssets("8px 0"),
                    boxSizing: resolveAssets("border-box"),
                    borderBottom: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                  },
                  children: [
                    jsxs("a", {
                      href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                      style: {
                        display: resolveAssets("inline-flex"),
                        alignItems: resolveAssets("center"),
                        gap: resolveAssets("10px"),
                        minHeight: resolveAssets("44px"),
                        fontSize: resolveAssets("15px"),
                        color: resolveAssets("oklch(0.965 0.006 220)"),
                      },
                      className: "ported-hover-49",
                      children: [
                        jsxs("svg", {
                          width: "18",
                          height: "18",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          "aria-hidden": "true",
                          children: [jsx("path", { d: "M19 12H5" }), jsx("path", { d: "m12 19-7-7 7-7" })],
                        }),
                        "All Evolution products",
                      ],
                    }),
                    jsx(ExtremisPromoLogo, {
                      alt: "Extremis — Trade. Analyze. Evolve.",
                      width: 1536,
                      height: 864,
                      style: { width: "160px", height: "90px", objectFit: "contain", flexShrink: 0 },
                    }),
                    jsxs("nav", {
                      "aria-label": "Extremis OS sections",
                      style: {
                        marginLeft: resolveAssets("auto"),
                        display: resolveAssets("flex"),
                        flexWrap: resolveAssets("wrap"),
                        gap: resolveAssets("0 28px"),
                      },
                      children: [
                        jsx("a", {
                          href: resolveAssets("#overview"),
                          style: {
                            display: resolveAssets("inline-flex"),
                            alignItems: resolveAssets("center"),
                            minHeight: resolveAssets("44px"),
                            fontSize: resolveAssets("15px"),
                            color: resolveAssets("oklch(0.965 0.006 220)"),
                          },
                          className: "ported-hover-50",
                          children: "Overview",
                        }),
                        jsx("a", {
                          href: resolveAssets("#previews"),
                          style: {
                            display: resolveAssets("inline-flex"),
                            alignItems: resolveAssets("center"),
                            minHeight: resolveAssets("44px"),
                            fontSize: resolveAssets("15px"),
                            color: resolveAssets("oklch(0.965 0.006 220)"),
                          },
                          className: "ported-hover-51",
                          children: "Previews",
                        }),
                        jsx("a", {
                          href: resolveAssets("#access"),
                          style: {
                            display: resolveAssets("inline-flex"),
                            alignItems: resolveAssets("center"),
                            minHeight: resolveAssets("44px"),
                            fontSize: resolveAssets("15px"),
                            color: resolveAssets("oklch(0.965 0.006 220)"),
                          },
                          className: "ported-hover-52",
                          children: "Access",
                        }),
                        jsx("a", {
                          href: resolveAssets("#faq"),
                          style: {
                            display: resolveAssets("inline-flex"),
                            alignItems: resolveAssets("center"),
                            minHeight: resolveAssets("44px"),
                            fontSize: resolveAssets("15px"),
                            color: resolveAssets("oklch(0.965 0.006 220)"),
                          },
                          className: "ported-hover-53",
                          children: "FAQ",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              jsxs("main", {
                id: "top",
                children: [
                  jsxs("section", {
                    "data-screen-label": "Hero",
                    style: { position: resolveAssets("relative"), isolation: resolveAssets("isolate") },
                    children: [
                      jsx("img", {
                        src: asset("assets/extremis-mountain.png"),
                        width: "504",
                        height: "250",
                        alt: "",
                        "aria-hidden": "true",
                        style: {
                          position: resolveAssets("absolute"),
                          zIndex: resolveAssets("-1"),
                          top: resolveAssets("0"),
                          left: resolveAssets("50%"),
                          transform: resolveAssets("translateX(-50%)"),
                          width: resolveAssets("min(1100px,100%)"),
                          height: resolveAssets("auto"),
                          opacity: resolveAssets("0.35"),
                          WebkitMaskImage: resolveAssets(
                            "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
                          ),
                          maskImage: resolveAssets("radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)"),
                        },
                      }),
                      jsxs("div", {
                        style: {
                          maxWidth: resolveAssets("1240px"),
                          margin: resolveAssets("0 auto"),
                          padding: resolveAssets("clamp(36px,5vw,72px) clamp(20px,3vw,40px) 40px"),
                          display: resolveAssets("flex"),
                          flexWrap: resolveAssets("wrap"),
                          alignItems: resolveAssets("center"),
                          gap: resolveAssets("36px 56px"),
                        },
                        children: [
                          jsxs("div", {
                            style: { flex: resolveAssets("1 1 380px"), minWidth: resolveAssets("0") },
                            children: [
                              jsx("p", {
                                style: {
                                  fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                  fontSize: resolveAssets("12px"),
                                  letterSpacing: resolveAssets("0.14em"),
                                  textTransform: resolveAssets("uppercase"),
                                  color: resolveAssets("oklch(0.74 0.17 27)"),
                                },
                                children: "Extremis OS / Trading operating system",
                              }),
                              jsxs("h1", {
                                style: {
                                  fontSize: resolveAssets("clamp(40px,5.2vw,72px)"),
                                  fontWeight: resolveAssets("600"),
                                  lineHeight: resolveAssets("1.04"),
                                  letterSpacing: resolveAssets("-0.02em"),
                                  marginTop: resolveAssets("18px"),
                                  textWrap: resolveAssets("balance"),
                                },
                                children: ["Discipline", jsx("br", {}), "builds freedom."],
                              }),
                              jsx("p", {
                                style: {
                                  fontSize: resolveAssets("clamp(17px,1.5vw,20px)"),
                                  lineHeight: resolveAssets("1.7"),
                                  marginTop: resolveAssets("22px"),
                                  maxWidth: resolveAssets("520px"),
                                  color: resolveAssets("oklch(0.88 0.008 230)"),
                                  textWrap: resolveAssets("pretty"),
                                },
                                children:
                                  "A trading operating system for your process. The current interface is a design preview of a desktop home with performance, a trade log, strategy analytics and a market overview.",
                              }),
                              jsxs("p", {
                                style: {
                                  display: resolveAssets("inline-flex"),
                                  alignItems: resolveAssets("center"),
                                  gap: resolveAssets("10px"),
                                  marginTop: resolveAssets("22px"),
                                  padding: resolveAssets("10px 14px"),
                                  border: resolveAssets("1px solid oklch(0.6 0.23 27 / 0.6)"),
                                  fontSize: resolveAssets("14px"),
                                  lineHeight: resolveAssets("1.5"),
                                  color: resolveAssets("oklch(0.9 0.008 230)"),
                                },
                                children: [
                                  jsx("span", {
                                    "aria-hidden": "true",
                                    style: {
                                      width: resolveAssets("7px"),
                                      height: resolveAssets("7px"),
                                      borderRadius: resolveAssets("50%"),
                                      background: resolveAssets("oklch(0.6 0.23 27)"),
                                      flexShrink: resolveAssets("0"),
                                    },
                                  }),
                                  "Design preview. No live market feed, broker connection or replay.",
                                ],
                              }),
                              jsxs("div", {
                                style: {
                                  display: resolveAssets("flex"),
                                  flexWrap: resolveAssets("wrap"),
                                  gap: resolveAssets("12px"),
                                  marginTop: resolveAssets("28px"),
                                },
                                children: [
                                  jsx("a", {
                                    href: resolveAssets("#previews"),
                                    style: {
                                      display: resolveAssets("inline-flex"),
                                      alignItems: resolveAssets("center"),
                                      justifyContent: resolveAssets("center"),
                                      minHeight: resolveAssets("48px"),
                                      boxSizing: resolveAssets("border-box"),
                                      padding: resolveAssets("0 24px"),
                                      background: resolveAssets("oklch(0.6 0.23 27)"),
                                      color: resolveAssets("oklch(0.13 0.006 240)"),
                                      fontSize: resolveAssets("16px"),
                                      fontWeight: resolveAssets("500"),
                                      transition: resolveAssets("filter 180ms,transform 180ms"),
                                    },
                                    className: "ported-hover-54",
                                    children: "See the previews",
                                  }),
                                  jsx("a", {
                                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                                    style: {
                                      display: resolveAssets("inline-flex"),
                                      alignItems: resolveAssets("center"),
                                      justifyContent: resolveAssets("center"),
                                      minHeight: resolveAssets("48px"),
                                      boxSizing: resolveAssets("border-box"),
                                      padding: resolveAssets("0 24px"),
                                      border: resolveAssets("1px solid oklch(0.4 0.01 230)"),
                                      color: resolveAssets("oklch(0.965 0.006 220)"),
                                      fontSize: resolveAssets("16px"),
                                      fontWeight: resolveAssets("500"),
                                      transition: resolveAssets("background 180ms"),
                                    },
                                    className: "ported-hover-55",
                                    children: "Back to all systems",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          jsxs("figure", {
                            style: {
                              flex: resolveAssets("1.3 1 460px"),
                              minWidth: resolveAssets("0"),
                              margin: resolveAssets("0"),
                            },
                            children: [
                              jsx("div", {
                                style: {
                                  padding: resolveAssets("6px"),
                                  border: resolveAssets("2px solid oklch(0.6 0.23 27)"),
                                  borderRadius: resolveAssets("8px"),
                                  background: resolveAssets("oklch(0.08 0.005 240)"),
                                  boxShadow: resolveAssets(
                                    "0 0 36px -4px oklch(0.6 0.23 27 / 0.55), inset 0 0 18px -8px oklch(0.6 0.23 27 / 0.55)",
                                  ),
                                },
                                children: jsx("img", {
                                  src: EXTREMIS_DASHBOARD_SRC,
                                  width: "1180",
                                  height: "757",
                                  alt: "Extremis OS actual demo dashboard with the new logo: unconfigured account, empty trade journal and no market data connected",
                                  style: {
                                    display: resolveAssets("block"),
                                    width: resolveAssets("100%"),
                                    height: resolveAssets("auto"),
                                    borderRadius: resolveAssets("4px"),
                                  },
                                }),
                              }),
                              jsx("figcaption", {
                                style: {
                                  fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                  fontSize: resolveAssets("12px"),
                                  letterSpacing: resolveAssets("0.08em"),
                                  marginTop: resolveAssets("10px"),
                                  textAlign: resolveAssets("center"),
                                  color: resolveAssets("oklch(0.78 0.012 230)"),
                                },
                                children: "Design preview \xB7 sample data",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  jsx("section", {
                    id: "overview",
                    "data-screen-label": "Overview",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                      padding: resolveAssets("clamp(48px,6vw,88px) 0"),
                      scrollMarginTop: resolveAssets("24px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1240px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3vw,40px)"),
                      },
                      children: [
                        jsx("p", {
                          style: {
                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                            fontSize: resolveAssets("12px"),
                            letterSpacing: resolveAssets("0.14em"),
                            textTransform: resolveAssets("uppercase"),
                            color: resolveAssets("oklch(0.74 0.17 27)"),
                          },
                          children: "Product overview",
                        }),
                        jsx("h2", {
                          style: {
                            fontSize: resolveAssets("clamp(30px,3.4vw,44px)"),
                            fontWeight: resolveAssets("600"),
                            lineHeight: resolveAssets("1.12"),
                            marginTop: resolveAssets("14px"),
                            maxWidth: resolveAssets("640px"),
                            textWrap: resolveAssets("balance"),
                          },
                          children: "One desktop home for the trading process.",
                        }),
                        jsx("div", {
                          style: {
                            display: resolveAssets("grid"),
                            gridTemplateColumns: resolveAssets("repeat(auto-fit,minmax(min(100%,250px),1fr))"),
                            gap: resolveAssets("0"),
                            marginTop: resolveAssets("36px"),
                            borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                          },
                          children: (overview || []).map((o2, index) =>
                            jsx(
                              React.Fragment,
                              {
                                children: jsxs("article", {
                                  style: {
                                    padding: resolveAssets("26px 24px 28px 0"),
                                    borderBottom: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                                  },
                                  children: [
                                    jsx("p", {
                                      style: {
                                        fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                        fontSize: resolveAssets("12px"),
                                        color: resolveAssets("oklch(0.74 0.17 27)"),
                                      },
                                      children: o2.n,
                                    }),
                                    jsx("h3", {
                                      style: {
                                        fontSize: resolveAssets("22px"),
                                        fontWeight: resolveAssets("600"),
                                        marginTop: resolveAssets("10px"),
                                      },
                                      children: o2.title,
                                    }),
                                    jsx("p", {
                                      style: {
                                        fontSize: resolveAssets("16px"),
                                        lineHeight: resolveAssets("1.7"),
                                        marginTop: resolveAssets("10px"),
                                        color: resolveAssets("oklch(0.84 0.01 230)"),
                                        textWrap: resolveAssets("pretty"),
                                      },
                                      children: o2.text,
                                    }),
                                  ],
                                }),
                              },
                              index,
                            ),
                          ),
                        }),
                        jsx("p", {
                          style: {
                            fontSize: resolveAssets("14px"),
                            lineHeight: resolveAssets("1.7"),
                            marginTop: resolveAssets("22px"),
                            color: resolveAssets("oklch(0.78 0.012 230)"),
                          },
                          children:
                            "The chart, trade log and market panels show a preview of the interface only. Figures in the artwork are illustrative sample data.",
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "previews",
                    "data-screen-label": "Design previews",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                      padding: resolveAssets("clamp(48px,6vw,88px) 0"),
                      background: resolveAssets("oklch(0.16 0.008 240 / 0.6)"),
                      scrollMarginTop: resolveAssets("24px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1240px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3vw,40px)"),
                      },
                      children: [
                        jsx("p", {
                          style: {
                            fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                            fontSize: resolveAssets("12px"),
                            letterSpacing: resolveAssets("0.14em"),
                            textTransform: resolveAssets("uppercase"),
                            color: resolveAssets("oklch(0.74 0.17 27)"),
                          },
                          children: "Design previews",
                        }),
                        jsx("h2", {
                          style: {
                            fontSize: resolveAssets("clamp(30px,3.4vw,44px)"),
                            fontWeight: resolveAssets("600"),
                            lineHeight: resolveAssets("1.12"),
                            marginTop: resolveAssets("14px"),
                            textWrap: resolveAssets("balance"),
                          },
                          children: "Journal. Strategies. Analytics.",
                        }),
                        jsxs("div", {
                          style: {
                            marginTop: resolveAssets("32px"),
                            border: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                            background: resolveAssets("oklch(0.13 0.006 240)"),
                          },
                          children: [
                            jsx("div", {
                              role: "tablist",
                              "aria-label": "Design previews",
                              style: {
                                display: resolveAssets("grid"),
                                gridTemplateColumns: resolveAssets("repeat(3,minmax(0,1fr))"),
                                borderBottom: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                              },
                              children: (tabs || []).map((t2, index) =>
                                jsx(
                                  React.Fragment,
                                  {
                                    children: jsx("button", {
                                      type: "button",
                                      role: "tab",
                                      id: "tab-" + t2.id,
                                      "aria-selected": t2.selected,
                                      "aria-controls": "panel",
                                      tabIndex: t2.tab,
                                      onClick: t2.onClick,
                                      onKeyDown: t2.onKey,
                                      style: {
                                        minHeight: resolveAssets("56px"),
                                        padding: resolveAssets("0 8px"),
                                        border: resolveAssets("0"),
                                        borderBottom: resolveAssets("3px solid " + t2.line),
                                        background: resolveAssets(t2.bg),
                                        color: resolveAssets(t2.color),
                                        fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                        fontSize: resolveAssets("clamp(15px,1.5vw,18px)"),
                                        fontWeight: resolveAssets("600"),
                                        cursor: resolveAssets("pointer"),
                                        transition: resolveAssets("background 180ms,color 180ms"),
                                      },
                                      className: "ported-hover-56",
                                      children: t2.name,
                                    }),
                                  },
                                  index,
                                ),
                              ),
                            }),
                            jsxs("div", {
                              role: "tabpanel",
                              id: "panel",
                              "aria-labelledby": "tab-" + p.id,
                              style: { padding: resolveAssets("clamp(20px,3vw,36px)") },
                              children: [
                                jsx("h3", {
                                  style: {
                                    fontSize: resolveAssets("clamp(22px,2.2vw,28px)"),
                                    fontWeight: resolveAssets("600"),
                                  },
                                  children: p.title,
                                }),
                                jsx("p", {
                                  style: {
                                    fontSize: resolveAssets("16px"),
                                    lineHeight: resolveAssets("1.7"),
                                    marginTop: resolveAssets("10px"),
                                    maxWidth: resolveAssets("620px"),
                                    color: resolveAssets("oklch(0.84 0.01 230)"),
                                    textWrap: resolveAssets("pretty"),
                                  },
                                  children: p.text,
                                }),
                                jsx("div", {
                                  style: {
                                    marginTop: resolveAssets("24px"),
                                    borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                                  },
                                  children: (p.rows || []).map((r2, index) =>
                                    jsx(
                                      React.Fragment,
                                      {
                                        children: jsxs("div", {
                                          style: {
                                            display: resolveAssets("grid"),
                                            gridTemplateColumns: resolveAssets(
                                              "repeat(auto-fit,minmax(min(100%,150px),1fr))",
                                            ),
                                            gap: resolveAssets("6px 20px"),
                                            alignItems: resolveAssets("center"),
                                            padding: resolveAssets("16px 0"),
                                            borderBottom: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                                          },
                                          children: [
                                            jsx("span", {
                                              style: {
                                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                                fontSize: resolveAssets("13px"),
                                                color: resolveAssets("oklch(0.74 0.17 27)"),
                                              },
                                              children: r2.a,
                                            }),
                                            jsx("span", {
                                              style: {
                                                fontSize: resolveAssets("16px"),
                                                lineHeight: resolveAssets("1.5"),
                                              },
                                              children: r2.b,
                                            }),
                                            jsxs("span", {
                                              style: {
                                                display: resolveAssets("flex"),
                                                alignItems: resolveAssets("center"),
                                                gap: resolveAssets("12px"),
                                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                                fontSize: resolveAssets("14px"),
                                                color: resolveAssets("oklch(0.88 0.008 230)"),
                                              },
                                              children: [
                                                r2.bar
                                                  ? jsx(Fragment, {
                                                      children: jsx("span", {
                                                        "aria-hidden": "true",
                                                        style: {
                                                          flex: resolveAssets("1 1 0"),
                                                          height: resolveAssets("8px"),
                                                          background: resolveAssets("oklch(0.25 0.01 240)"),
                                                        },
                                                        children: jsx("span", {
                                                          style: {
                                                            display: resolveAssets("block"),
                                                            height: resolveAssets("100%"),
                                                            width: resolveAssets(r2.bar),
                                                            background: resolveAssets("oklch(0.6 0.23 27)"),
                                                          },
                                                        }),
                                                      }),
                                                    })
                                                  : null,
                                                jsx("span", { children: r2.c }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      },
                                      index,
                                    ),
                                  ),
                                }),
                                jsx("p", {
                                  style: {
                                    fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                    fontSize: resolveAssets("12px"),
                                    letterSpacing: resolveAssets("0.06em"),
                                    marginTop: resolveAssets("18px"),
                                    color: resolveAssets("oklch(0.78 0.012 230)"),
                                  },
                                  children: "Design preview \xB7 feature overview. No trading data is shown.",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "access",
                    "data-screen-label": "Access",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                      padding: resolveAssets("clamp(48px,6vw,88px) 0"),
                      scrollMarginTop: resolveAssets("24px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1240px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3vw,40px)"),
                        display: resolveAssets("flex"),
                        flexWrap: resolveAssets("wrap"),
                        gap: resolveAssets("24px clamp(36px,5.5vw,80px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: { flex: resolveAssets("1.2 1 380px") },
                          children: [
                            jsx("p", {
                              style: {
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                letterSpacing: resolveAssets("0.14em"),
                                textTransform: resolveAssets("uppercase"),
                                color: resolveAssets("oklch(0.74 0.17 27)"),
                              },
                              children: "Access status",
                            }),
                            jsx("h2", {
                              style: {
                                fontSize: resolveAssets("clamp(30px,3.4vw,44px)"),
                                fontWeight: resolveAssets("600"),
                                lineHeight: resolveAssets("1.12"),
                                marginTop: resolveAssets("14px"),
                                textWrap: resolveAssets("balance"),
                              },
                              children: promoSalesCopy.section9,
                            }),
                          ],
                        }),
                        jsxs("div", {
                          style: { flex: resolveAssets("1 1 340px") },
                          children: [
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("16px"),
                                lineHeight: resolveAssets("1.8"),
                                color: resolveAssets("oklch(0.84 0.01 230)"),
                                textWrap: resolveAssets("pretty"),
                              },
                              children: promoSalesCopy.section10,
                            }),
                            jsxs("a", {
                              href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                              style: {
                                display: resolveAssets("inline-flex"),
                                alignItems: resolveAssets("center"),
                                gap: resolveAssets("8px"),
                                minHeight: resolveAssets("44px"),
                                marginTop: resolveAssets("10px"),
                                fontSize: resolveAssets("15px"),
                                color: resolveAssets("oklch(0.74 0.17 27)"),
                              },
                              className: "ported-hover-57",
                              children: [
                                "Pricing & bundle overview ",
                                jsx("span", { "aria-hidden": "true", children: "\u2197" }),
                              ],
                            }),
                            jsx("a", {
                              href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                              style: {
                                display: resolveAssets("inline-flex"),
                                alignItems: resolveAssets("center"),
                                gap: resolveAssets("10px"),
                                marginTop: resolveAssets("22px"),
                                minHeight: resolveAssets("48px"),
                                boxSizing: resolveAssets("border-box"),
                                padding: resolveAssets("0 22px"),
                                border: resolveAssets("1px solid oklch(0.4 0.01 230)"),
                                color: resolveAssets("oklch(0.965 0.006 220)"),
                                fontSize: resolveAssets("16px"),
                                fontWeight: resolveAssets("500"),
                              },
                              className: "ported-hover-58",
                              children: "Back to all systems",
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx("section", {
                    id: "faq",
                    "data-screen-label": "FAQ",
                    style: {
                      borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                      padding: resolveAssets("clamp(48px,6vw,88px) 0"),
                      scrollMarginTop: resolveAssets("24px"),
                    },
                    children: jsxs("div", {
                      style: {
                        maxWidth: resolveAssets("1240px"),
                        margin: resolveAssets("0 auto"),
                        padding: resolveAssets("0 clamp(20px,3vw,40px)"),
                        display: resolveAssets("flex"),
                        flexWrap: resolveAssets("wrap"),
                        gap: resolveAssets("24px clamp(36px,5.5vw,80px)"),
                      },
                      children: [
                        jsxs("div", {
                          style: { flex: resolveAssets("1 1 320px") },
                          children: [
                            jsx("p", {
                              style: {
                                fontFamily: resolveAssets("'JetBrains Mono',monospace"),
                                fontSize: resolveAssets("12px"),
                                letterSpacing: resolveAssets("0.14em"),
                                textTransform: resolveAssets("uppercase"),
                                color: resolveAssets("oklch(0.74 0.17 27)"),
                              },
                              children: "Questions",
                            }),
                            jsx("h2", {
                              style: {
                                fontSize: resolveAssets("clamp(30px,3.4vw,44px)"),
                                fontWeight: resolveAssets("600"),
                                lineHeight: resolveAssets("1.12"),
                                marginTop: resolveAssets("14px"),
                                textWrap: resolveAssets("balance"),
                              },
                              children: "Straight answers.",
                            }),
                          ],
                        }),
                        jsx("div", {
                          style: {
                            flex: resolveAssets("1.4 1 420px"),
                            borderTop: resolveAssets("1px solid oklch(0.3 0.01 230)"),
                          },
                          children: (faqs || []).map((q2, index) =>
                            jsx(
                              React.Fragment,
                              {
                                children: jsxs("div", {
                                  style: { borderBottom: resolveAssets("1px solid oklch(0.3 0.01 230)") },
                                  children: [
                                    jsx("h3", {
                                      style: {
                                        fontSize: resolveAssets("inherit"),
                                        fontWeight: resolveAssets("inherit"),
                                      },
                                      children: jsxs("button", {
                                        type: "button",
                                        "aria-expanded": q2.open,
                                        onClick: q2.toggle,
                                        style: {
                                          width: resolveAssets("100%"),
                                          display: resolveAssets("grid"),
                                          gridTemplateColumns: resolveAssets("minmax(0,1fr) 24px"),
                                          alignItems: resolveAssets("center"),
                                          gap: resolveAssets("16px"),
                                          padding: resolveAssets("18px 0"),
                                          minHeight: resolveAssets("64px"),
                                          border: resolveAssets("0"),
                                          background: resolveAssets("none"),
                                          color: resolveAssets("oklch(0.965 0.006 220)"),
                                          fontFamily: resolveAssets("'Space Grotesk',sans-serif"),
                                          fontSize: resolveAssets("17px"),
                                          lineHeight: resolveAssets("1.5"),
                                          textAlign: resolveAssets("left"),
                                          cursor: resolveAssets("pointer"),
                                        },
                                        className: "ported-hover-59",
                                        children: [
                                          jsx("span", { children: q2.question }),
                                          jsx("span", {
                                            "aria-hidden": "true",
                                            style: {
                                              fontSize: resolveAssets("26px"),
                                              fontWeight: resolveAssets("300"),
                                              color: resolveAssets("oklch(0.74 0.17 27)"),
                                              textAlign: resolveAssets("center"),
                                              transform: resolveAssets(q2.rot),
                                              transition: resolveAssets("transform 200ms"),
                                            },
                                            children: "+",
                                          }),
                                        ],
                                      }),
                                    }),
                                    q2.open
                                      ? jsx(Fragment, {
                                          children: jsx("p", {
                                            style: {
                                              fontSize: resolveAssets("16px"),
                                              lineHeight: resolveAssets("1.8"),
                                              color: resolveAssets("oklch(0.84 0.01 230)"),
                                              padding: resolveAssets("0 40px 22px 0"),
                                              textWrap: resolveAssets("pretty"),
                                            },
                                            children: q2.answer,
                                          }),
                                        })
                                      : null,
                                  ],
                                }),
                              },
                              index,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              null,
            ],
          }),
        ],
      });
    }
  }
  return ExtremisPage2;
})();
function AboutPage() {
  return jsxs(Fragment, {
    children: [
      jsx("style", {
        children: resolveAssets(
          "\nhtml{scroll-behavior:smooth}\nbody{margin:0;background:#02050c;color:oklch(0.965 0.006 220);font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\nh1,h2,h3,p{margin:0}\na{color:oklch(0.82 0.14 205);text-decoration:none}\na:hover{color:oklch(0.9 0.12 205)}\na:focus-visible{outline:3px solid oklch(0.82 0.14 205);outline-offset:3px;border-radius:2px}\n",
        ),
      }),
      jsxs("div", {
        style: {
          minHeight: resolveAssets("100vh"),
          background: resolveAssets(
            "radial-gradient(ellipse at 70% 10%,oklch(0.25 0.1 250 / 0.5),transparent 55%),#02050c",
          ),
        },
        children: [
          jsxs("header", {
            style: {
              maxWidth: resolveAssets("1200px"),
              margin: resolveAssets("0 auto"),
              padding: resolveAssets("12px clamp(16px,3vw,40px)"),
              display: resolveAssets("flex"),
              flexWrap: resolveAssets("wrap"),
              alignItems: resolveAssets("center"),
              gap: resolveAssets("4px 32px"),
              borderBottom: resolveAssets("1px solid oklch(0.3 0.06 240)"),
            },
            children: [
              jsx("a", {
                href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                "aria-label": "Evolution Co home",
                style: {
                  fontFamily: resolveAssets("Michroma,sans-serif"),
                  fontSize: resolveAssets("16px"),
                  letterSpacing: resolveAssets("0.28em"),
                  color: resolveAssets("oklch(0.965 0.006 220)"),
                  minHeight: resolveAssets("44px"),
                  display: resolveAssets("inline-flex"),
                  alignItems: resolveAssets("center"),
                },
                children: "EVOLUTION CO",
              }),
              jsxs("nav", {
                "aria-label": "Main",
                style: {
                  display: resolveAssets("flex"),
                  flexWrap: resolveAssets("wrap"),
                  gap: resolveAssets("0 12px"),
                },
                children: [
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Home",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Products",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=philosophy"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Philosophy",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=about"),
                    "aria-current": "page",
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.82 0.14 205)"),
                      borderBottom: resolveAssets("2px solid oklch(0.82 0.14 205)"),
                    },
                    children: "About",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Pricing",
                  }),
                ],
              }),
            ],
          }),
          jsxs("main", {
            style: {
              maxWidth: resolveAssets("1200px"),
              margin: resolveAssets("0 auto"),
              padding: resolveAssets("0 clamp(16px,3vw,40px) 56px"),
            },
            children: [
              jsxs("section", {
                style: {
                  display: resolveAssets("grid"),
                  gridTemplateColumns: resolveAssets("repeat(auto-fit,minmax(min(100%,340px),1fr))"),
                  gap: resolveAssets("24px"),
                  alignItems: resolveAssets("center"),
                  paddingTop: resolveAssets("clamp(28px,5vw,64px)"),
                },
                children: [
                  jsxs("div", {
                    children: [
                      jsx("p", {
                        style: {
                          fontSize: resolveAssets("13px"),
                          letterSpacing: resolveAssets("0.2em"),
                          textTransform: resolveAssets("uppercase"),
                          color: resolveAssets("oklch(0.8 0.13 220)"),
                        },
                        children: "01 \u2014 About us",
                      }),
                      jsxs("h1", {
                        style: {
                          fontSize: resolveAssets("clamp(38px,6vw,76px)"),
                          fontWeight: resolveAssets("500"),
                          lineHeight: resolveAssets("1.05"),
                          textTransform: resolveAssets("uppercase"),
                          marginTop: resolveAssets("16px"),
                        },
                        children: [
                          "Interfaces for a ",
                          jsx("span", { style: { color: resolveAssets("oklch(0.76 0.15 235)") }, children: "higher" }),
                          " standard.",
                        ],
                      }),
                      jsx("p", {
                        style: {
                          fontSize: resolveAssets("clamp(17px,1.6vw,21px)"),
                          lineHeight: resolveAssets("1.6"),
                          marginTop: resolveAssets("22px"),
                          maxWidth: resolveAssets("520px"),
                          color: resolveAssets("oklch(0.93 0.006 220)"),
                        },
                        children:
                          "Evolution Co designs digital interfaces that help people bring structure, clarity, and discipline to their lives. We combine aesthetics, systems, and technology to create tools that turn intention into action.",
                      }),
                      jsxs("p", {
                        style: {
                          marginTop: resolveAssets("26px"),
                          paddingLeft: resolveAssets("16px"),
                          borderLeft: resolveAssets("2px solid oklch(0.8 0.13 220)"),
                          fontSize: resolveAssets("14px"),
                          letterSpacing: resolveAssets("0.18em"),
                          textTransform: resolveAssets("uppercase"),
                          lineHeight: resolveAssets("1.7"),
                          color: resolveAssets("oklch(0.9 0.02 230)"),
                        },
                        children: ["More than software.", jsx("br", {}), "A higher standard."],
                      }),
                    ],
                  }),
                  jsxs("div", {
                    style: {
                      position: resolveAssets("relative"),
                      width: resolveAssets("100%"),
                      aspectRatio: resolveAssets("1/1"),
                    },
                    children: [
                      jsx("img", {
                        src: asset("assets/about-bonsai.png"),
                        width: "450",
                        height: "450",
                        alt: "Glowing blue bonsai on a circuit-lit pedestal",
                        style: {
                          display: resolveAssets("block"),
                          width: resolveAssets("100%"),
                          height: resolveAssets("100%"),
                        },
                      }),
                      jsx("span", {
                        "aria-hidden": "true",
                        style: {
                          position: resolveAssets("absolute"),
                          left: resolveAssets("0"),
                          top: resolveAssets("0"),
                          width: resolveAssets("16%"),
                          height: resolveAssets("28%"),
                          background: resolveAssets("#030911"),
                        },
                      }),
                      jsx("span", {
                        "aria-hidden": "true",
                        style: {
                          position: resolveAssets("absolute"),
                          left: resolveAssets("16%"),
                          top: resolveAssets("0"),
                          width: resolveAssets("8%"),
                          height: resolveAssets("28%"),
                          background: resolveAssets("linear-gradient(90deg,#030911,transparent)"),
                        },
                      }),
                      jsx("span", {
                        "aria-hidden": "true",
                        style: {
                          position: resolveAssets("absolute"),
                          left: resolveAssets("0"),
                          top: resolveAssets("28%"),
                          width: resolveAssets("16%"),
                          height: resolveAssets("8%"),
                          background: resolveAssets("linear-gradient(180deg,#030911,transparent)"),
                        },
                      }),
                      jsx("span", {
                        "aria-hidden": "true",
                        style: {
                          position: resolveAssets("absolute"),
                          right: resolveAssets("0"),
                          top: resolveAssets("0"),
                          width: resolveAssets("22%"),
                          height: resolveAssets("5%"),
                          background: resolveAssets("linear-gradient(270deg,#02060f 60%,transparent)"),
                        },
                      }),
                    ],
                  }),
                ],
              }),
              jsxs("section", {
                "aria-labelledby": "what",
                style: { marginTop: resolveAssets("clamp(32px,5vw,64px)") },
                children: [
                  jsx("p", {
                    id: "what",
                    style: {
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.2em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.8 0.13 220)"),
                    },
                    children: "02 \u2014 What we do",
                  }),
                  jsxs("div", {
                    style: {
                      display: resolveAssets("grid"),
                      gridTemplateColumns: resolveAssets("repeat(auto-fit,minmax(min(100%,220px),1fr))"),
                      gap: resolveAssets("16px"),
                      marginTop: resolveAssets("20px"),
                    },
                    children: [
                      jsx("article", {
                        style: {
                          padding: resolveAssets("1px"),
                          background: resolveAssets("linear-gradient(160deg,oklch(0.82 0.14 205),oklch(0.5 0.15 240))"),
                          clipPath: resolveAssets(
                            "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                          ),
                          filter: resolveAssets("drop-shadow(0 0 10px oklch(0.6 0.18 240 / 0.6))"),
                        },
                        children: jsxs("div", {
                          style: {
                            height: resolveAssets("100%"),
                            boxSizing: resolveAssets("border-box"),
                            padding: resolveAssets("22px 18px 18px"),
                            background: resolveAssets("oklch(0.11 0.03 250)"),
                            clipPath: resolveAssets(
                              "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                            ),
                            textAlign: resolveAssets("center"),
                          },
                          children: [
                            jsx("img", {
                              src: asset("assets/about-icon-design.png"),
                              width: "100",
                              height: "90",
                              alt: "",
                              style: {
                                display: resolveAssets("block"),
                                width: resolveAssets("72px"),
                                height: resolveAssets("auto"),
                                margin: resolveAssets("0 auto"),
                              },
                            }),
                            jsx("h2", {
                              style: {
                                fontSize: resolveAssets("20px"),
                                fontWeight: resolveAssets("500"),
                                letterSpacing: resolveAssets("0.18em"),
                                textTransform: resolveAssets("uppercase"),
                                marginTop: resolveAssets("8px"),
                              },
                              children: "Design",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("16px"),
                                lineHeight: resolveAssets("1.5"),
                                marginTop: resolveAssets("10px"),
                                color: resolveAssets("oklch(0.9 0.006 220)"),
                              },
                              children: "Beautiful, intentional interfaces built for real life.",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("12px"),
                                letterSpacing: resolveAssets("0.16em"),
                                marginTop: resolveAssets("14px"),
                                textAlign: resolveAssets("left"),
                                color: resolveAssets("oklch(0.8 0.13 220)"),
                              },
                              children: "01 \u2014\u2014",
                            }),
                          ],
                        }),
                      }),
                      jsx("article", {
                        style: {
                          padding: resolveAssets("1px"),
                          background: resolveAssets("linear-gradient(160deg,oklch(0.82 0.14 205),oklch(0.5 0.15 240))"),
                          clipPath: resolveAssets(
                            "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                          ),
                          filter: resolveAssets("drop-shadow(0 0 10px oklch(0.6 0.18 240 / 0.6))"),
                        },
                        children: jsxs("div", {
                          style: {
                            height: resolveAssets("100%"),
                            boxSizing: resolveAssets("border-box"),
                            padding: resolveAssets("22px 18px 18px"),
                            background: resolveAssets("oklch(0.11 0.03 250)"),
                            clipPath: resolveAssets(
                              "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                            ),
                            textAlign: resolveAssets("center"),
                          },
                          children: [
                            jsx("img", {
                              src: asset("assets/about-icon-build.png"),
                              width: "100",
                              height: "90",
                              alt: "",
                              style: {
                                display: resolveAssets("block"),
                                width: resolveAssets("72px"),
                                height: resolveAssets("auto"),
                                margin: resolveAssets("0 auto"),
                              },
                            }),
                            jsx("h2", {
                              style: {
                                fontSize: resolveAssets("20px"),
                                fontWeight: resolveAssets("500"),
                                letterSpacing: resolveAssets("0.18em"),
                                textTransform: resolveAssets("uppercase"),
                                marginTop: resolveAssets("8px"),
                              },
                              children: "Build",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("16px"),
                                lineHeight: resolveAssets("1.5"),
                                marginTop: resolveAssets("10px"),
                                color: resolveAssets("oklch(0.9 0.006 220)"),
                              },
                              children: "Systems that turn goals into daily execution.",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("12px"),
                                letterSpacing: resolveAssets("0.16em"),
                                marginTop: resolveAssets("14px"),
                                textAlign: resolveAssets("left"),
                                color: resolveAssets("oklch(0.8 0.13 220)"),
                              },
                              children: "02 \u2014\u2014",
                            }),
                          ],
                        }),
                      }),
                      jsx("article", {
                        style: {
                          padding: resolveAssets("1px"),
                          background: resolveAssets("linear-gradient(160deg,oklch(0.82 0.14 205),oklch(0.5 0.15 240))"),
                          clipPath: resolveAssets(
                            "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                          ),
                          filter: resolveAssets("drop-shadow(0 0 10px oklch(0.6 0.18 240 / 0.6))"),
                        },
                        children: jsxs("div", {
                          style: {
                            height: resolveAssets("100%"),
                            boxSizing: resolveAssets("border-box"),
                            padding: resolveAssets("22px 18px 18px"),
                            background: resolveAssets("oklch(0.11 0.03 250)"),
                            clipPath: resolveAssets(
                              "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                            ),
                            textAlign: resolveAssets("center"),
                          },
                          children: [
                            jsx("img", {
                              src: asset("assets/about-icon-empower.png"),
                              width: "100",
                              height: "90",
                              alt: "",
                              style: {
                                display: resolveAssets("block"),
                                width: resolveAssets("72px"),
                                height: resolveAssets("auto"),
                                margin: resolveAssets("0 auto"),
                              },
                            }),
                            jsx("h2", {
                              style: {
                                fontSize: resolveAssets("20px"),
                                fontWeight: resolveAssets("500"),
                                letterSpacing: resolveAssets("0.18em"),
                                textTransform: resolveAssets("uppercase"),
                                marginTop: resolveAssets("8px"),
                              },
                              children: "Empower",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("16px"),
                                lineHeight: resolveAssets("1.5"),
                                marginTop: resolveAssets("10px"),
                                color: resolveAssets("oklch(0.9 0.006 220)"),
                              },
                              children: "Tools for everyone \u2014 from individuals to teams.",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("12px"),
                                letterSpacing: resolveAssets("0.16em"),
                                marginTop: resolveAssets("14px"),
                                textAlign: resolveAssets("left"),
                                color: resolveAssets("oklch(0.8 0.13 220)"),
                              },
                              children: "03 \u2014\u2014",
                            }),
                          ],
                        }),
                      }),
                      jsx("article", {
                        style: {
                          padding: resolveAssets("1px"),
                          background: resolveAssets("linear-gradient(160deg,oklch(0.82 0.14 205),oklch(0.5 0.15 240))"),
                          clipPath: resolveAssets(
                            "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                          ),
                          filter: resolveAssets("drop-shadow(0 0 10px oklch(0.6 0.18 240 / 0.6))"),
                        },
                        children: jsxs("div", {
                          style: {
                            height: resolveAssets("100%"),
                            boxSizing: resolveAssets("border-box"),
                            padding: resolveAssets("22px 18px 18px"),
                            background: resolveAssets("oklch(0.11 0.03 250)"),
                            clipPath: resolveAssets(
                              "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)",
                            ),
                            textAlign: resolveAssets("center"),
                          },
                          children: [
                            jsx("img", {
                              src: asset("assets/about-icon-evolve.png"),
                              width: "100",
                              height: "90",
                              alt: "",
                              style: {
                                display: resolveAssets("block"),
                                width: resolveAssets("72px"),
                                height: resolveAssets("auto"),
                                margin: resolveAssets("0 auto"),
                              },
                            }),
                            jsx("h2", {
                              style: {
                                fontSize: resolveAssets("20px"),
                                fontWeight: resolveAssets("500"),
                                letterSpacing: resolveAssets("0.18em"),
                                textTransform: resolveAssets("uppercase"),
                                marginTop: resolveAssets("8px"),
                              },
                              children: "Evolve",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("16px"),
                                lineHeight: resolveAssets("1.5"),
                                marginTop: resolveAssets("10px"),
                                color: resolveAssets("oklch(0.9 0.006 220)"),
                              },
                              children: "Constantly improving through feedback, data, and design.",
                            }),
                            jsx("p", {
                              style: {
                                fontSize: resolveAssets("12px"),
                                letterSpacing: resolveAssets("0.16em"),
                                marginTop: resolveAssets("14px"),
                                textAlign: resolveAssets("left"),
                                color: resolveAssets("oklch(0.8 0.13 220)"),
                              },
                              children: "04 \u2014\u2014",
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              jsxs("section", {
                "aria-labelledby": "bright",
                style: { marginTop: resolveAssets("clamp(32px,5vw,64px)") },
                children: [
                  jsx("p", {
                    id: "bright",
                    style: {
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.2em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.8 0.13 220)"),
                    },
                    children: "03 \u2014 Built for a brighter tomorrow",
                  }),
                  jsxs("div", {
                    style: {
                      marginTop: resolveAssets("20px"),
                      border: resolveAssets("2px solid oklch(0.5 0.15 240)"),
                      borderRadius: resolveAssets("12px"),
                      overflow: resolveAssets("hidden"),
                      background: resolveAssets("#02050c"),
                      boxShadow: resolveAssets("0 0 28px -8px oklch(0.6 0.18 240)"),
                    },
                    children: [
                      jsx("img", {
                        src: asset("assets/about-earth.png"),
                        width: "790",
                        height: "145",
                        alt: "Earth from orbit with city lights",
                        style: {
                          display: resolveAssets("block"),
                          width: resolveAssets("100%"),
                          height: resolveAssets("auto"),
                        },
                      }),
                      jsxs("div", {
                        style: {
                          display: resolveAssets("grid"),
                          gridTemplateColumns: resolveAssets("repeat(auto-fit,minmax(min(100%,200px),1fr))"),
                          gap: resolveAssets("16px"),
                          padding: resolveAssets("24px 20px"),
                          textAlign: resolveAssets("center"),
                        },
                        children: [
                          jsxs("p", {
                            style: { fontSize: resolveAssets("18px") },
                            children: [
                              jsx("span", {
                                style: {
                                  display: resolveAssets("block"),
                                  fontSize: resolveAssets("22px"),
                                  letterSpacing: resolveAssets("0.18em"),
                                  textTransform: resolveAssets("uppercase"),
                                  color: resolveAssets("oklch(0.8 0.13 220)"),
                                },
                                children: "People",
                              }),
                              "First",
                            ],
                          }),
                          jsxs("p", {
                            style: { fontSize: resolveAssets("18px") },
                            children: [
                              jsx("span", {
                                style: {
                                  display: resolveAssets("block"),
                                  fontSize: resolveAssets("22px"),
                                  letterSpacing: resolveAssets("0.18em"),
                                  textTransform: resolveAssets("uppercase"),
                                  color: resolveAssets("oklch(0.8 0.13 220)"),
                                },
                                children: "Design",
                              }),
                              "With Intention",
                            ],
                          }),
                          jsxs("p", {
                            style: { fontSize: resolveAssets("18px") },
                            children: [
                              jsx("span", {
                                style: {
                                  display: resolveAssets("block"),
                                  fontSize: resolveAssets("22px"),
                                  letterSpacing: resolveAssets("0.18em"),
                                  textTransform: resolveAssets("uppercase"),
                                  color: resolveAssets("oklch(0.8 0.13 220)"),
                                },
                                children: "Progress",
                              }),
                              "Always",
                            ],
                          }),
                        ],
                      }),
                      jsxs("p", {
                        style: {
                          padding: resolveAssets("0 20px 26px"),
                          textAlign: resolveAssets("center"),
                          fontSize: resolveAssets("18px"),
                          color: resolveAssets("oklch(0.93 0.006 220)"),
                        },
                        children: [
                          "\u201CBetter systems create a better you.\u201D ",
                          jsx("span", {
                            style: {
                              display: resolveAssets("block"),
                              marginTop: resolveAssets("6px"),
                              fontSize: resolveAssets("15px"),
                              color: resolveAssets("oklch(0.82 0.008 230)"),
                            },
                            children: "\u2014 Evolution Co",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function PhilosophyPage() {
  return jsxs(Fragment, {
    children: [
      jsx("style", {
        children: resolveAssets(
          "\nhtml{scroll-behavior:smooth}\nbody{margin:0;background:#02050c;color:oklch(0.965 0.006 220);font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\nh1,h2,h3,p{margin:0}\na{color:oklch(0.82 0.14 205);text-decoration:none}\na:hover{color:oklch(0.9 0.12 205)}\na:focus-visible{outline:3px solid oklch(0.82 0.14 205);outline-offset:3px;border-radius:2px}\n",
        ),
      }),
      jsxs("div", {
        style: {
          minHeight: resolveAssets("100vh"),
          background: resolveAssets(
            "radial-gradient(ellipse at 70% 10%,oklch(0.25 0.1 250 / 0.5),transparent 55%),#02050c",
          ),
        },
        children: [
          jsxs("header", {
            style: {
              maxWidth: resolveAssets("1200px"),
              margin: resolveAssets("0 auto"),
              padding: resolveAssets("12px clamp(16px,3vw,40px)"),
              display: resolveAssets("flex"),
              flexWrap: resolveAssets("wrap"),
              alignItems: resolveAssets("center"),
              gap: resolveAssets("4px 32px"),
              borderBottom: resolveAssets("1px solid oklch(0.3 0.06 240)"),
            },
            children: [
              jsx("a", {
                href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                "aria-label": "Evolution Co home",
                style: {
                  fontFamily: resolveAssets("Michroma,sans-serif"),
                  fontSize: resolveAssets("16px"),
                  letterSpacing: resolveAssets("0.28em"),
                  color: resolveAssets("oklch(0.965 0.006 220)"),
                  minHeight: resolveAssets("44px"),
                  display: resolveAssets("inline-flex"),
                  alignItems: resolveAssets("center"),
                },
                children: "EVOLUTION CO",
              }),
              jsxs("nav", {
                "aria-label": "Main",
                style: {
                  display: resolveAssets("flex"),
                  flexWrap: resolveAssets("wrap"),
                  gap: resolveAssets("0 12px"),
                },
                children: [
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Home",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Products",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=philosophy"),
                    "aria-current": "page",
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.82 0.14 205)"),
                      borderBottom: resolveAssets("2px solid oklch(0.82 0.14 205)"),
                    },
                    children: "Philosophy",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=about"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "About",
                  }),
                  jsx("a", {
                    href: resolveAssets("/evolution-promo/index.html?page=evolution"),
                    style: {
                      minHeight: resolveAssets("44px"),
                      padding: resolveAssets("0 6px"),
                      boxSizing: resolveAssets("border-box"),
                      display: resolveAssets("inline-flex"),
                      alignItems: resolveAssets("center"),
                      fontSize: resolveAssets("13px"),
                      letterSpacing: resolveAssets("0.14em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.95 0.01 220)"),
                      borderBottom: resolveAssets("2px solid transparent"),
                    },
                    children: "Pricing",
                  }),
                ],
              }),
            ],
          }),
          jsxs("main", {
            style: {
              maxWidth: resolveAssets("1200px"),
              margin: resolveAssets("0 auto"),
              padding: resolveAssets("0 clamp(16px,3vw,40px) 56px"),
            },
            children: [
              jsxs("section", {
                "aria-label": "Our philosophy",
                style: { paddingTop: resolveAssets("clamp(16px,3vw,32px)") },
                children: [
                  jsx("h1", {
                    style: {
                      position: resolveAssets("absolute"),
                      width: resolveAssets("1px"),
                      height: resolveAssets("1px"),
                      overflow: resolveAssets("hidden"),
                      clip: resolveAssets("rect(0 0 0 0)"),
                    },
                    children: "A more intentional world",
                  }),
                  jsx("p", {
                    style: {
                      position: resolveAssets("absolute"),
                      width: resolveAssets("1px"),
                      height: resolveAssets("1px"),
                      overflow: resolveAssets("hidden"),
                      clip: resolveAssets("rect(0 0 0 0)"),
                    },
                    children: "Higher standards. Brighter days.",
                  }),
                  jsx("img", {
                    src: asset("assets/phil-hero.png"),
                    width: "864",
                    height: "500",
                    alt: "Our philosophy: a more intentional world. A figure stands before a glowing ring portal showing a mountain range.",
                    style: {
                      display: resolveAssets("block"),
                      width: resolveAssets("100%"),
                      height: resolveAssets("auto"),
                    },
                  }),
                ],
              }),
              jsxs("section", {
                style: { marginTop: resolveAssets("clamp(24px,4vw,48px)"), maxWidth: resolveAssets("760px") },
                children: [
                  jsx("p", {
                    style: {
                      fontSize: resolveAssets("clamp(17px,1.6vw,20px)"),
                      lineHeight: resolveAssets("1.65"),
                      color: resolveAssets("oklch(0.93 0.006 220)"),
                    },
                    children:
                      "We believe a better life is built through better systems. Evolution Co exists to design the tools, knowledge, and environments that help people focus, grow, and take control of their future.",
                  }),
                  jsx("p", {
                    style: {
                      fontSize: resolveAssets("clamp(17px,1.6vw,20px)"),
                      lineHeight: resolveAssets("1.65"),
                      marginTop: resolveAssets("16px"),
                      color: resolveAssets("oklch(0.93 0.006 220)"),
                    },
                    children:
                      "Our philosophy is simple: when you have the right systems, you remove friction, eliminate chaos, and create space for what truly matters.",
                  }),
                ],
              }),
              jsxs("section", {
                "aria-label": "Principles",
                style: {
                  display: resolveAssets("grid"),
                  gridTemplateColumns: resolveAssets("repeat(auto-fit,minmax(min(100%,260px),1fr))"),
                  gap: resolveAssets("16px"),
                  marginTop: resolveAssets("32px"),
                },
                children: [
                  jsxs("article", {
                    style: {
                      padding: resolveAssets("22px"),
                      border: resolveAssets("1px solid oklch(0.5 0.15 240)"),
                      borderRadius: resolveAssets("10px"),
                      background: resolveAssets("oklch(0.12 0.03 250)"),
                    },
                    children: [
                      jsx("h2", {
                        style: {
                          fontSize: resolveAssets("18px"),
                          fontWeight: resolveAssets("500"),
                          letterSpacing: resolveAssets("0.2em"),
                          textTransform: resolveAssets("uppercase"),
                        },
                        children: "Intention",
                      }),
                      jsx("p", {
                        style: {
                          fontSize: resolveAssets("16px"),
                          lineHeight: resolveAssets("1.5"),
                          marginTop: resolveAssets("8px"),
                          color: resolveAssets("oklch(0.9 0.006 220)"),
                        },
                        children: "Live with purpose. Design your life.",
                      }),
                    ],
                  }),
                  jsxs("article", {
                    style: {
                      padding: resolveAssets("22px"),
                      border: resolveAssets("1px solid oklch(0.5 0.15 240)"),
                      borderRadius: resolveAssets("10px"),
                      background: resolveAssets("oklch(0.12 0.03 250)"),
                    },
                    children: [
                      jsx("h2", {
                        style: {
                          fontSize: resolveAssets("18px"),
                          fontWeight: resolveAssets("500"),
                          letterSpacing: resolveAssets("0.2em"),
                          textTransform: resolveAssets("uppercase"),
                        },
                        children: "Discipline",
                      }),
                      jsx("p", {
                        style: {
                          fontSize: resolveAssets("16px"),
                          lineHeight: resolveAssets("1.5"),
                          marginTop: resolveAssets("8px"),
                          color: resolveAssets("oklch(0.9 0.006 220)"),
                        },
                        children: "Small actions create big results.",
                      }),
                    ],
                  }),
                  jsxs("article", {
                    style: {
                      padding: resolveAssets("22px"),
                      border: resolveAssets("1px solid oklch(0.5 0.15 240)"),
                      borderRadius: resolveAssets("10px"),
                      background: resolveAssets("oklch(0.12 0.03 250)"),
                    },
                    children: [
                      jsx("h2", {
                        style: {
                          fontSize: resolveAssets("18px"),
                          fontWeight: resolveAssets("500"),
                          letterSpacing: resolveAssets("0.2em"),
                          textTransform: resolveAssets("uppercase"),
                        },
                        children: "Simplicity",
                      }),
                      jsx("p", {
                        style: {
                          fontSize: resolveAssets("16px"),
                          lineHeight: resolveAssets("1.5"),
                          marginTop: resolveAssets("8px"),
                          color: resolveAssets("oklch(0.9 0.006 220)"),
                        },
                        children: "Less chaos, more clarity.",
                      }),
                    ],
                  }),
                  jsxs("article", {
                    style: {
                      padding: resolveAssets("22px"),
                      border: resolveAssets("1px solid oklch(0.5 0.15 240)"),
                      borderRadius: resolveAssets("10px"),
                      background: resolveAssets("oklch(0.12 0.03 250)"),
                    },
                    children: [
                      jsx("h2", {
                        style: {
                          fontSize: resolveAssets("18px"),
                          fontWeight: resolveAssets("500"),
                          letterSpacing: resolveAssets("0.2em"),
                          textTransform: resolveAssets("uppercase"),
                        },
                        children: "Freedom",
                      }),
                      jsx("p", {
                        style: {
                          fontSize: resolveAssets("16px"),
                          lineHeight: resolveAssets("1.5"),
                          marginTop: resolveAssets("8px"),
                          color: resolveAssets("oklch(0.9 0.006 220)"),
                        },
                        children: "Better systems give you options.",
                      }),
                    ],
                  }),
                ],
              }),
              jsxs("figure", {
                style: {
                  margin: resolveAssets("32px 0 0"),
                  padding: resolveAssets("26px 20px"),
                  border: resolveAssets("1px solid oklch(0.55 0.16 240)"),
                  borderRadius: resolveAssets("10px"),
                  textAlign: resolveAssets("center"),
                  background: resolveAssets("oklch(0.1 0.03 250)"),
                },
                children: [
                  jsx("blockquote", {
                    style: {
                      margin: resolveAssets("0"),
                      fontSize: resolveAssets("clamp(16px,2vw,22px)"),
                      letterSpacing: resolveAssets("0.18em"),
                      textTransform: resolveAssets("uppercase"),
                    },
                    children: "\u201CDiscipline creates freedom.\u201D",
                  }),
                  jsx("figcaption", {
                    style: {
                      marginTop: resolveAssets("8px"),
                      fontSize: resolveAssets("14px"),
                      letterSpacing: resolveAssets("0.18em"),
                      textTransform: resolveAssets("uppercase"),
                      color: resolveAssets("oklch(0.8 0.13 220)"),
                    },
                    children: "\u2014 Evolution Co",
                  }),
                ],
              }),
              jsx("img", {
                src: asset("assets/phil-mountains.png"),
                width: "590",
                height: "225",
                alt: "Dark mountain range under a bright peak",
                style: {
                  display: resolveAssets("block"),
                  width: resolveAssets("100%"),
                  maxWidth: resolveAssets("590px"),
                  height: resolveAssets("auto"),
                  margin: resolveAssets("32px auto 0"),
                },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export default function Promo() {
  const page = new URLSearchParams(window.location.search).get("page") || "evolution";
  const Page =
    { evolution: EvolutionPage, about: AboutPage, philosophy: PhilosophyPage }[
      page
    ] || EvolutionPage;
  return jsxs(Fragment, {
    children: [
      jsx("style", {
        children:
          ".ported-hover-1:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-2:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-3:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-4:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-5:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-6:hover{box-shadow:0 0 0 2px oklch(0.82 0.14 205 / 0.7)}\n.ported-hover-7:hover{box-shadow:0 0 0 2px oklch(0.82 0.14 205 / 0.7)}\n.ported-hover-8:hover{box-shadow:0 0 0 2px oklch(0.82 0.14 205 / 0.7)}\n.ported-hover-9:hover{box-shadow:0 0 0 2px oklch(0.82 0.14 205 / 0.7)}\n.ported-hover-10:hover{filter:brightness(1.12);transform:translateY(-1px);color:oklch(0.13 0.006 240)}\n.ported-hover-11:hover{filter:brightness(1.12);transform:translateY(-1px);color:oklch(0.13 0.006 240)}\n.ported-hover-12:hover{background:oklch(0.22 0.012 240)}\n.ported-hover-13:hover{background:oklch(0.22 0.012 240)}\n.ported-hover-14:hover{background:oklch(0.22 0.012 240)}\n.ported-hover-15:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-16:hover{background:oklch(0.76 0.13 205);color:oklch(0.14 0.016 225)}\n.ported-hover-17:hover{transform:translateY(-2px);color:oklch(0.14 0.016 225)}\n.ported-hover-18:hover{background:oklch(0.22 0.019 230);transform:translateY(-2px);color:oklch(0.965 0.006 220)}\n.ported-hover-19:hover{transform:translateY(-3px)}\n.ported-hover-20:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-21:hover{background:oklch(0.22 0.019 230);color:oklch(0.82 0.14 205)}\n.ported-hover-22:hover{text-decoration:underline}\n.ported-hover-23:hover{background:oklch(0.22 0.019 230);color:oklch(0.82 0.14 205)}\n.ported-hover-24:hover{background:oklch(0.22 0.019 230);color:oklch(0.82 0.14 205)}\n.ported-hover-25:hover{background:oklch(0.22 0.019 230);color:oklch(0.82 0.14 205)}\n.ported-hover-26:hover{background:oklch(0.22 0.019 230);color:oklch(0.82 0.14 205)}\n.ported-hover-27:hover{background:oklch(0.22 0.019 230)}\n.ported-hover-28:hover{background:oklch(0.22 0.019 230)}\n.ported-hover-29:hover{background:oklch(0.22 0.019 230)}\n.ported-hover-30:hover{background:oklch(0.22 0.019 230)}\n.ported-hover-31:hover{text-decoration:underline}\n.ported-hover-32:hover{background:oklch(0.22 0.019 230);transform:translateY(-2px);color:oklch(0.965 0.006 220)}\n.ported-hover-33:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-34:hover{transform:translateY(-2px);color:oklch(0.14 0.016 225)}\n.ported-hover-35:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-36:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-37:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-38:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-39:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-40:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-41:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-42:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-43:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-44:hover{color:oklch(0.82 0.14 205)}\n.ported-hover-45:hover{background:oklch(0.22 0.019 230);color:oklch(0.965 0.006 220)}\n.ported-hover-46:hover{text-decoration:underline}\n.ported-hover-47:hover{background:oklch(0.22 0.019 230);color:oklch(0.965 0.006 220)}\n.ported-hover-48:hover{text-decoration:underline}\n.ported-hover-49:hover{color:oklch(0.74 0.17 27)}\n.ported-hover-50:hover{color:oklch(0.74 0.17 27)}\n.ported-hover-51:hover{color:oklch(0.74 0.17 27)}\n.ported-hover-52:hover{color:oklch(0.74 0.17 27)}\n.ported-hover-53:hover{color:oklch(0.74 0.17 27)}\n.ported-hover-54:hover{filter:brightness(1.12);transform:translateY(-1px);color:oklch(0.13 0.006 240)}\n.ported-hover-55:hover{background:oklch(0.2 0.01 240);color:oklch(0.965 0.006 220)}\n.ported-hover-56:hover{color:oklch(0.74 0.17 27)}\n.ported-hover-57:hover{text-decoration:underline}\n.ported-hover-58:hover{background:oklch(0.2 0.01 240);color:oklch(0.965 0.006 220)}\n.ported-hover-59:hover{color:oklch(0.74 0.17 27)}",
      }),
      jsx(Page, {}, page),
      jsx(PromoSalesFooter, { page }),
    ],
  });
}

function PromoSalesFooter({ page }) {
  return (
    <footer className="promo-sales-footer" data-tone={page === "extremis" ? "red" : "cyan"}>
      <div className="promo-footer-inner">
        <div className="promo-footer-intro">
          <a className="promo-footer-brand" href="/evolution-promo/index.html?page=evolution">
            Evolution Co<span aria-hidden="true">.</span>
          </a>
          <p>{promoSalesCopy.tagline}</p>
          <p className="promo-footer-summary">{promoSalesCopy.summary}</p>
          <a className="promo-footer-cta" href="/evolution-promo/index.html?page=evolution">
            Explore the systems <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="promo-footer-columns">
          {promoFooterGroups.map((group) => (
            <nav key={group.title} aria-label={group.title + " footer links"}>
              <h2>{group.title}</h2>
              {group.links.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <div className="promo-footer-bottom">
          <p>© {new Date().getFullYear()} Evolution Co. All rights reserved.</p>
          <p>{promoSalesCopy.availability}</p>
        </div>
      </div>
    </footer>
  );
}

