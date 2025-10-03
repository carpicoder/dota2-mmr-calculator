const ranks=[
    {name:"Herald",mmr:[0,154,308,462,616]},
    {name:"Guardian",mmr:[770,924,1078,1232,1386]},
    {name:"Crusader",mmr:[1540,1694,1848,2002,2156]},
    {name:"Archon",mmr:[2310,2464,2618,2772,2926]},
    {name:"Legend",mmr:[3080,3234,3388,3542,3696]},
    {name:"Ancient",mmr:[3850,4004,4158,4312,4466]},
    {name:"Divine",mmr:[4620,4820,5020,5220,5420]},
    {name:"Immortal",mmr:[5620]}
];

const MMR_PER_WIN = 25;

const form = document.querySelector(".form");
const input = document.querySelector(".mmr-input");
const rankInfo = document.querySelector(".rank-info");
const invalidSpan = document.createElement("span");
const currentRankCardContainer = document.querySelector(".current-rank");
const nextRankCardContainer = document.querySelector(".next-rank");
const nextMedalCardContainer = document.querySelector(".next-medal");
const currentRankImageEl = document.querySelector(".current-rank-image");
const nextRankImageEl = document.querySelector(".next-rank-image");
const nextMedalImageEl = document.querySelector(".next-medal-image");
const currentRankNameEl = document.querySelector(".current-rank-name");
const currentRankMmrEl = document.querySelector(".current-rank-mmr");
const nextRankNameEl = document.querySelector(".next-rank-name");
const nextRankMmrEl = document.querySelector(".next-rank-mmr");
const nextMedalNameEl = document.querySelector(".next-medal-name");
const nextMedalMmrEl = document.querySelector(".next-medal-mmr");
const nextRankInfoContainer = document.querySelector(".next-rank-info");
const nextRankInfoYourMmrEl = document.querySelector(".next-rank-info-your-mmr");
const nextRankInfoNextMmrEl = document.querySelector(".next-rank-info-next-mmr");
const nextRankInfoMmrNeededEl = document.querySelector(".next-rank-info-mmr-needed");
const nextRankInfoGamesNeededEl = document.querySelector(".next-rank-info-games-needed");
const nextMedalInfoNextMmrEl = document.querySelector(".next-medal-info-next-mmr");
const nextMedalInfoMmrNeededEl = document.querySelector(".next-medal-info-mmr-needed");
const nextMedalInfoGamesNeededEl = document.querySelector(".next-medal-info-games-needed");
const previousRankInfoMmrNeededEl = document.querySelector(".previous-rank-info-mmr-needed");
const previousRankInfoGamesNeededEl = document.querySelector(".previous-rank-info-games-needed");
const formSubtitle = document.querySelector(".form-subtitle");

form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
    event.preventDefault();
    const mmrValue=input.value.trim();
    const existingInvalidSpan = form.querySelector(".invalid-mmr");

    if (existingInvalidSpan) {
        existingInvalidSpan.remove();
    }
    rankInfo.classList.add("hidden");

    if(!/^[0-9]+$/.test(mmrValue) || mmrValue === '') {
        invalidSpan.className = 'invalid-mmr text-danger d-block';
        invalidSpan.textContent = !mmrValue ? "Please enter your MMR." : "MMR must be a valid number. (No dots, no commas)";
        form.querySelector('.input-group').insertAdjacentElement("afterend", invalidSpan);
        formSubtitle.classList.remove("hidden");
        return;
    }

    const mmr=parseInt(mmrValue,10);
    let currentRank=null;
    let nextRank=null;
    let nextMedal=null;
    let previousRank=null;

    for(let i=0;i<ranks.length;i++){
        const rankData = ranks[i];
        if (rankData.name === "Immortal") {
            if (mmr >= rankData.mmr[0]) {
                 currentRank = { name: "Immortal", level: null, mmr: rankData.mmr[0] };
                 nextRank = null;
                 nextMedal = null;
                 
                 // Para Immortal, el rango anterior es Divine V
                 const divineRankData = ranks[ranks.length - 2]; // Divine es el penúltimo
                 previousRank = {
                     name: divineRankData.name,
                     level: divineRankData.mmr.length, // Último nivel de Divine (V)
                     mmr: divineRankData.mmr[divineRankData.mmr.length - 1] // Divine V MMR
                 };
                 break;
            }
        } else {
             for (let j = 0; j < rankData.mmr.length; j++) {
                 const currentLevelMMR = rankData.mmr[j];
                 const nextLevelMMR = rankData.mmr[j + 1];
                 const nextMedalRankData = ranks[i+1];
                 const nextMedalStartMMR = nextMedalRankData ? nextMedalRankData.mmr[0] : Infinity;

                 if (mmr >= currentLevelMMR && mmr < (nextLevelMMR ?? nextMedalStartMMR)) {
                     currentRank = { name: rankData.name, level: j + 1, mmr: currentLevelMMR };

                     if (nextLevelMMR !== undefined) {
                         nextRank = { name: rankData.name, level: j + 2, mmr: nextLevelMMR };
                     } else if (nextMedalRankData) {
                         nextRank = {
                             name: nextMedalRankData.name,
                             level: nextMedalRankData.name === "Immortal" ? null : 1,
                             mmr: nextMedalStartMMR
                         };
                     } else {
                         nextRank = null;
                     }
                     break;
                 }
             }
        }
         if (currentRank) break;
    }

    if (currentRank && currentRank.name !== "Immortal") {
        const currentMedalIndex = ranks.findIndex(rank => rank.name === currentRank.name);
        const nextMedalRankData = ranks[currentMedalIndex + 1];
        if (nextMedalRankData) {
              nextMedal = {
                    name: nextMedalRankData.name,
                    level: nextMedalRankData.name === "Immortal" ? null : 1,
                    mmr: nextMedalRankData.mmr[0]
              };
        } else {
            nextMedal = null;
        }

        // Calcular rango anterior
        if (currentRank.level > 1) {
            // Si no es el primer nivel del rango, el anterior es el nivel anterior del mismo rango
            previousRank = {
                name: currentRank.name,
                level: currentRank.level - 1,
                mmr: ranks[currentMedalIndex].mmr[currentRank.level - 2]
            };
        } else if (currentMedalIndex > 0) {
            // Si es el primer nivel, el anterior es el último nivel del rango anterior
            const previousMedalRankData = ranks[currentMedalIndex - 1];
            previousRank = {
                name: previousMedalRankData.name,
                level: previousMedalRankData.mmr.length, // Último nivel del rango anterior
                mmr: previousMedalRankData.mmr[previousMedalRankData.mmr.length - 1]
            };
        } else {
            // Si es Herald I, no hay rango anterior
            previousRank = null;
        }
     }

    if (!currentRank) {
        if (mmr >= 0) {
            currentRank = { name: ranks[0].name, level: 1, mmr: ranks[0].mmr[0] };
            nextRank = { name: ranks[0].name, level: 2, mmr: ranks[0].mmr[1] };
            nextMedal = { name: ranks[1].name, level: 1, mmr: ranks[1].mmr[0] };
        } else {
            rankInfo.classList.add("hidden");
            invalidSpan.className = 'invalid-mmr text-danger d-block';
            invalidSpan.textContent = "Could not determine rank.";
            form.querySelector('.input-group').insertAdjacentElement("afterend", invalidSpan);
            return;
        }
    }
    updateRankInfo(currentRank,nextRank,nextMedal,previousRank,mmr);
}

function removeColClasses(element) {
    if (!element) return;
    const classesToRemove = [];
    element.classList.forEach(className => {
        if (className.startsWith('col-')) {
            classesToRemove.push(className);
        }
    });
    if (classesToRemove.length > 0) {
        element.classList.remove(...classesToRemove);
    }
}

function showElement(element, bootstrapClasses = []) {
    if (element) {
        removeColClasses(element);
        element.classList.remove('hidden');
        if (bootstrapClasses.length > 0) {
            element.classList.add(...bootstrapClasses);
        }
    }
}

function hideElement(element) {
    if (element) {
        removeColClasses(element);
        element.classList.add('hidden');
    }
}

function updateRankInfo(current,next,nextMedal,previous,userMMR){
    hideElement(currentRankCardContainer);
    hideElement(nextRankCardContainer);
    hideElement(nextMedalCardContainer);
    hideElement(nextRankInfoYourMmrEl);
    hideElement(nextRankInfoNextMmrEl);
    hideElement(nextRankInfoMmrNeededEl);
    hideElement(nextRankInfoGamesNeededEl);
    hideElement(nextMedalInfoNextMmrEl);
    hideElement(nextMedalInfoMmrNeededEl);
    hideElement(nextMedalInfoGamesNeededEl);
    hideElement(previousRankInfoMmrNeededEl);
    hideElement(previousRankInfoGamesNeededEl);
    hideElement(nextRankInfoContainer);

    currentRankNameEl.textContent=`${current.name} ${current.name !== 'Immortal' ? romanize(current.level) : ''}`;
    currentRankMmrEl.textContent=`${current.mmr} MMR`;
    currentRankImageEl.src = `./img/${current.name.toLowerCase()}${current.name === 'Immortal' ? '' : '-' + current.level}.webp`;
    formSubtitle.classList.add("hidden");

    if(current.name==="Immortal"){
        showElement(currentRankCardContainer, ["col-12"]);
        showElement(nextRankInfoContainer);
        showElement(nextRankInfoYourMmrEl);
        nextRankInfoYourMmrEl.textContent=`You have ${userMMR} MMR`;
        showElement(nextRankInfoMmrNeededEl)
        nextRankInfoMmrNeededEl.innerHTML = "You're already Immortal, wtf are you doing here?!";
        nextRankInfoMmrNeededEl.className = 'next-rank-info-mmr-needed info-needed bg-primary-subtle text-primary-emphasis p-2 rounded d-inline-block me-2 mb-2';
        
        // Mostrar información del rango anterior para Immortal
        if (previous) {
            const previousRankFullName = `${previous.name} ${previous.name !== 'Immortal' ? romanize(previous.level) : ""}`;
            
            // Para Immortal, el threshold es el último MMR de Divine V
            const mmrThreshold = 5619; // Último MMR de Divine V
            const mmrToLose = userMMR - mmrThreshold;
            const gamesToLose = mmrToLose > 0 ? Math.ceil(mmrToLose / MMR_PER_WIN) : 0;
            
            showElement(previousRankInfoMmrNeededEl);
            previousRankInfoMmrNeededEl.innerHTML = `<strong>${mmrToLose > 0 ? mmrToLose : 0} MMR</strong> to fall to <strong>${previousRankFullName}</strong>`;
            previousRankInfoMmrNeededEl.className = 'previous-rank-info-mmr-needed info-needed-previous bg-warning-subtle text-warning-emphasis p-2 rounded d-block mb-2';
            
            showElement(previousRankInfoGamesNeededEl);
            previousRankInfoGamesNeededEl.innerHTML = `Approx <strong>${gamesToLose} losses</strong> to fall to <strong>${previousRankFullName}</strong>`;
            previousRankInfoGamesNeededEl.className = 'previous-rank-info-games-needed info-needed-previous bg-warning-subtle text-warning-emphasis p-2 rounded d-block mb-2';
        }
    } else {
        let visibleCards = 0;
        let isDivine5Case = false;

        showElement(currentRankCardContainer);
        visibleCards++;

        showElement(nextRankInfoContainer);
        showElement(nextRankInfoYourMmrEl);
        nextRankInfoYourMmrEl.textContent=`You have ${userMMR} MMR`;

        if (next) {
            showElement(nextRankCardContainer);
            visibleCards++;
            const nextRankFullName = `${next.name} ${next.name !== 'Immortal' ? romanize(next.level) : ""}`;
            nextRankNameEl.textContent = nextRankFullName;
            nextRankMmrEl.textContent = `${next.mmr} MMR`;
            nextRankImageEl.src = `./img/${next.name.toLowerCase()}${next.name === 'Immortal' ? '' : '-' + next.level}.webp`;

            if (next.name === 'Immortal') isDivine5Case = true;

            const mmrNeeded = next.mmr - userMMR;
            const gamesNeeded = mmrNeeded > 0 ? Math.ceil(mmrNeeded / MMR_PER_WIN) : 0;
            showElement(nextRankInfoNextMmrEl);
            nextRankInfoNextMmrEl.textContent = `${nextRankFullName} starts at ${next.mmr} MMR`;
            showElement(nextRankInfoMmrNeededEl)
            nextRankInfoMmrNeededEl.innerHTML = `<strong>${mmrNeeded > 0 ? mmrNeeded : 0} MMR</strong> to reach <strong>${nextRankFullName}</strong>`;
            nextRankInfoMmrNeededEl.className = 'next-rank-info-mmr-needed info-needed bg-success-subtle text-success-emphasis p-2 rounded d-inline-block me-2 mb-2';
            showElement(nextRankInfoGamesNeededEl);
            nextRankInfoGamesNeededEl.innerHTML = `Approx <strong>${gamesNeeded} wins</strong> to reach <strong>${nextRankFullName}</strong>`;
            nextRankInfoGamesNeededEl.className = 'next-rank-info-games-needed info-needed bg-success-subtle text-success-emphasis p-2 rounded d-inline-block mb-2';
        }

        const shouldShowNextMedalCard = nextMedal && nextMedal.name !== current.name && !isDivine5Case;
        if (shouldShowNextMedalCard) {
            showElement(nextMedalCardContainer);
            visibleCards++;
            const nextMedalFullName = `${nextMedal.name} ${nextMedal.name !== 'Immortal' ? romanize(nextMedal.level) : ""}`;
            nextMedalNameEl.textContent = nextMedalFullName;
            nextMedalMmrEl.textContent = `${nextMedal.mmr} MMR`;
            nextMedalImageEl.src = `./img/${nextMedal.name.toLowerCase()}${nextMedal.level ? '-' + nextMedal.level : ''}.webp`;
            const nextMedalMmrNeeded = nextMedal.mmr - userMMR;
            const nextMedalGamesNeeded = nextMedalMmrNeeded > 0 ? Math.ceil(nextMedalMmrNeeded / MMR_PER_WIN) : 0;

            showElement(nextMedalInfoNextMmrEl);
            nextMedalInfoNextMmrEl.textContent = `${nextMedalFullName} starts at ${nextMedal.mmr} MMR`;
            showElement(nextMedalInfoMmrNeededEl);
            nextMedalInfoMmrNeededEl.innerHTML = `<strong>${nextMedalMmrNeeded > 0 ? nextMedalMmrNeeded : 0} MMR</strong> to reach <strong>${nextMedalFullName}</strong>`;
            nextMedalInfoMmrNeededEl.className = 'next-medal-info-mmr-needed info-needed-medal bg-primary-subtle text-primary-emphasis p-2 rounded d-inline-block me-2 mb-2';
            showElement(nextMedalInfoGamesNeededEl);
            nextMedalInfoGamesNeededEl.innerHTML = `Approx <strong>${nextMedalGamesNeeded} wins</strong> to reach <strong>${nextMedalFullName}</strong>`;
            nextMedalInfoGamesNeededEl.className = 'next-medal-info-games-needed info-needed-medal bg-primary-subtle text-primary-emphasis p-2 rounded d-inline-block mb-2';
        } else {
             hideElement(nextMedalCardContainer);
             hideElement(nextMedalInfoNextMmrEl);
             hideElement(nextMedalInfoMmrNeededEl);
             hideElement(nextMedalInfoGamesNeededEl);
        }

        // Mostrar información del rango anterior
        if (previous) {
            const previousRankFullName = `${previous.name} ${previous.name !== 'Immortal' ? romanize(previous.level) : ""}`;
            
            // Calcular cuánto MMR necesitas perder para bajar al rango anterior
            let mmrThreshold;
            if (current.level > 1) {
                // Si no es el primer nivel, el threshold es el último MMR del nivel anterior del mismo rango
                const currentMedalIndex = ranks.findIndex(rank => rank.name === current.name);
                // Para obtener el último MMR del nivel anterior, necesitamos el MMR de inicio del nivel actual - 1
                mmrThreshold = ranks[currentMedalIndex].mmr[current.level - 1] - 1;
            } else {
                // Si es el primer nivel, el threshold es el último MMR del rango anterior
                const currentMedalIndex = ranks.findIndex(rank => rank.name === current.name);
                const previousMedalRankData = ranks[currentMedalIndex - 1];
                // El último MMR del rango anterior es el MMR de inicio del rango actual - 1
                mmrThreshold = current.mmr - 1;
            }
            const mmrToLose = userMMR - mmrThreshold;
            const gamesToLose = mmrToLose > 0 ? Math.ceil(mmrToLose / MMR_PER_WIN) : 0;
            
            showElement(previousRankInfoMmrNeededEl);
            previousRankInfoMmrNeededEl.innerHTML = `<strong>${mmrToLose > 0 ? mmrToLose : 0} MMR</strong> to fall to <strong>${previousRankFullName}</strong>`;
            previousRankInfoMmrNeededEl.className = 'previous-rank-info-mmr-needed info-needed-previous bg-warning-subtle text-warning-emphasis p-2 rounded d-inline-block me-2 mb-2';
            
            showElement(previousRankInfoGamesNeededEl);
            previousRankInfoGamesNeededEl.innerHTML = `Approx <strong>${gamesToLose} losses</strong> to fall to <strong>${previousRankFullName}</strong>`;
            previousRankInfoGamesNeededEl.className = 'previous-rank-info-games-needed info-needed-previous bg-warning-subtle text-warning-emphasis p-2 rounded d-inline-block mb-2';
        } else {
            hideElement(previousRankInfoMmrNeededEl);
            hideElement(previousRankInfoGamesNeededEl);
        }

        if (visibleCards === 3) {
            showElement(currentRankCardContainer, ["col-sm-6", "col-lg-4"]);
            showElement(nextRankCardContainer, ["col-sm-6", "col-lg-4"]);
            showElement(nextMedalCardContainer, ["col-sm-6", "col-lg-4"]);
        } else if (visibleCards === 2) {
            showElement(currentRankCardContainer, ["col-sm-4"]);
            showElement(nextRankCardContainer, ["col-sm-8"]);
        } else if (visibleCards === 1) {
            showElement(currentRankCardContainer, ["col-12"]);
        }

    }
    rankInfo.classList.remove("hidden");
}

function romanize(num){
    if (num === null || num === undefined || num < 1 || num > 5) return '';
    const roman=["I","II","III","IV","V"];
    return roman[num-1];
}