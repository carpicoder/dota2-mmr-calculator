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
const MMR_PER_LOSS = 25;
const MMR_SWING = MMR_PER_WIN + MMR_PER_LOSS;

const form = document.querySelector(".form");
const input = document.querySelector(".mmr-input");
const rankInfo = document.querySelector(".rank-info");
const invalidSpan = document.createElement("span");
const extraCalculators = document.getElementById('extra-calculators');
const winrateInput = document.getElementById('winrate-input');
const calculateGamesBtn = document.getElementById('calculate-games-btn');
const gamesNeededResultEl = document.getElementById('games-needed-result');
const targetRankNameEl = document.querySelector('#winrate-games-calc .target-rank-name');
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
const formSubtitle = document.querySelector(".form-subtitle");

form.addEventListener("submit", handleSubmit);
if (calculateGamesBtn) {
    calculateGamesBtn.addEventListener('click', displayGamesNeededWithWinrate);
}
winrateInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        displayGamesNeededWithWinrate();
    }
});

function handleSubmit(event) {
    event.preventDefault();
    const mmrValue=input.value.trim();
    const existingInvalidSpan = form.querySelector(".invalid-mmr");

    if (existingInvalidSpan) {
        existingInvalidSpan.remove();
    }
    rankInfo.classList.add("hidden");
    extraCalculators?.classList.add("hidden");

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

    for(let i=0;i<ranks.length;i++){
        const rankData = ranks[i];
        if (rankData.name === "Immortal") {
            if (mmr >= rankData.mmr[0]) {
                 currentRank = { name: "Immortal", level: null, mmr: rankData.mmr[0] };
                 nextRank = null;
                 nextMedal = null;
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
     }

    if (!currentRank) {
        if (mmr >= 0) {
            currentRank = { name: ranks[0].name, level: 1, mmr: ranks[0].mmr[0] };
            nextRank = { name: ranks[0].name, level: 2, mmr: ranks[0].mmr[1] };
            nextMedal = { name: ranks[1].name, level: 1, mmr: ranks[1].mmr[0] };
        } else {
            rankInfo.classList.add("hidden");
            extraCalculators?.classList.add("hidden");
            invalidSpan.className = 'invalid-mmr text-danger d-block';
            invalidSpan.textContent = "Could not determine rank.";
            form.querySelector('.input-group').insertAdjacentElement("afterend", invalidSpan);
            return;
        }
    }
    updateRankInfo(currentRank,nextRank,nextMedal,mmr);
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


function updateRankInfo(current,next,nextMedal,userMMR){
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
    hideElement(nextRankInfoContainer);

    if(gamesNeededResultEl) gamesNeededResultEl.textContent = '';
    if(targetRankNameEl) targetRankNameEl.textContent = 'next rank';
    if(winrateInput) winrateInput.value = '';

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
        nextRankInfoMmrNeededEl.innerHTML = "You are Immortal!";
        nextRankInfoMmrNeededEl.className = 'next-rank-info-mmr-needed info-needed bg-primary-subtle text-primary-emphasis p-2 rounded d-inline-block me-2 mb-2';
        extraCalculators?.classList.add("hidden");
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
            nextRankInfoMmrNeededEl.className = 'next-rank-info-mmr-needed info-needed bg-primary-subtle text-primary-emphasis p-2 rounded d-inline-block me-2 mb-2';
            showElement(nextRankInfoGamesNeededEl);
            nextRankInfoGamesNeededEl.innerHTML = `Approx <strong>${gamesNeeded} wins</strong> to reach <strong>${nextRankFullName}</strong>`;
            nextRankInfoGamesNeededEl.className = 'next-rank-info-games-needed info-needed bg-primary-subtle text-primary-emphasis p-2 rounded d-inline-block mb-2';
            rankInfo.dataset.nextRankMmrNeeded = mmrNeeded > 0 ? mmrNeeded : 0;
            if(targetRankNameEl) targetRankNameEl.textContent = nextRankFullName;
        } else {
             rankInfo.dataset.nextRankMmrNeeded = 0;
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
            nextMedalInfoMmrNeededEl.className = 'next-medal-info-mmr-needed info-needed-medal bg-dark-subtle text-emphasis-color p-2 rounded d-inline-block me-2 mb-2';
            showElement(nextMedalInfoGamesNeededEl);
            nextMedalInfoGamesNeededEl.innerHTML = `Approx <strong>${nextMedalGamesNeeded} wins</strong> to reach <strong>${nextMedalFullName}</strong>`;
            nextMedalInfoGamesNeededEl.className = 'next-medal-info-games-needed info-needed-medal bg-dark-subtle text-emphasis-color p-2 rounded d-inline-block mb-2';
            rankInfo.dataset.nextMedalMmrNeeded = nextMedalMmrNeeded > 0 ? nextMedalMmrNeeded : 0;
        } else {
             hideElement(nextMedalCardContainer);
             hideElement(nextMedalInfoNextMmrEl);
             hideElement(nextMedalInfoMmrNeededEl);
             hideElement(nextMedalInfoGamesNeededEl);
             rankInfo.dataset.nextMedalMmrNeeded = 0;
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

        extraCalculators?.classList.remove("hidden");
    }
    rankInfo.classList.remove("hidden");
}

function romanize(num){
    if (num === null || num === undefined || num < 1 || num > 5) return '';
    const roman=["I","II","III","IV","V"];
    return roman[num-1];
}

function showCalculationResult(element, message, isError = false, statusClass = '') {
    if (!element) return;
    element.innerHTML = '';
    element.className = 'calc-result text-center mt-3 mb-0';

    if (isError) {
        element.classList.add('text-danger');
        element.textContent = message;
    } else {
        if (statusClass) {
            element.classList.add(statusClass);
        } else {
            element.classList.add('text-success');
        }
        element.classList.add('fw-bold');
        element.innerHTML = message;
    }
}


function displayGamesNeededWithWinrate() {
    const wrValue = parseFloat(winrateInput.value);
    const mmrNeeded = parseFloat(rankInfo.dataset.nextRankMmrNeeded) || 0;

    if (!gamesNeededResultEl) return;

    if (isNaN(wrValue) || wrValue < 0 || wrValue > 100) {
        showCalculationResult(gamesNeededResultEl, "Please enter a valid winrate (0-100%).", true);
        return;
    }

    if (mmrNeeded <= 0) {
         showCalculationResult(gamesNeededResultEl, "You don't need MMR for the next rank!", false, 'text-info');
        return;
    }

    const winrate = wrValue / 100;
    const avgGain = (winrate * MMR_PER_WIN) - ((1 - winrate) * MMR_PER_LOSS);

    if (winrate === 0.5) {
        showCalculationResult(gamesNeededResultEl, `With exactly 50% winrate, your MMR won't change.`, false, 'text-info');
        return;
    }
    if (avgGain < 0) {
        showCalculationResult(gamesNeededResultEl, `With a winrate of ${wrValue}% (<50%), you will lose MMR over time.`, true);
        return;
    }
    if (avgGain < 0.01 && avgGain > 0) {
         showCalculationResult(gamesNeededResultEl, `With ${wrValue}% winrate, the MMR gain is too small to calculate reliably (needs infinite games?).`, false, 'text-warning');
         return;
    }

    const gamesNeeded = Math.ceil(mmrNeeded / avgGain);

    if (!isFinite(gamesNeeded) || gamesNeeded < 0) {
         showCalculationResult(gamesNeededResultEl, "Calculation resulted in an unexpected value.", true);
         return;
    }
    showCalculationResult(gamesNeededResultEl, `With ${wrValue}% winrate, you need approx. ${gamesNeeded} games.`);

}