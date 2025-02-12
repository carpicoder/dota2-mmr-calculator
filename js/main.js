const ranks = [
    { name: "Herald", mmr: [0, 154, 308, 462, 616] },
    { name: "Guardian", mmr: [770, 924, 1078, 1232, 1386] },
    { name: "Crusader", mmr: [1540, 1694, 1848, 2002, 2156] },
    { name: "Archon", mmr: [2310, 2464, 2618, 2772, 2926] },
    { name: "Legend", mmr: [3080, 3234, 3388, 3542, 3696] },
    { name: "Ancient", mmr: [3850, 4004, 4158, 4312, 4466] },
    { name: "Divine", mmr: [4620, 4820, 5020, 5220, 5420] },
    { name: "Immortal", mmr: [5620] }
];

const form = document.querySelector(".form");
const input = document.querySelector(".mmr-input");
const rankInfo = document.querySelector(".rank-info");
const invalidSpan = document.createElement("span");
invalidSpan.classList.add("invalid-mmr");
invalidSpan.textContent = "Invalid MMR. MMR must be a valid number.";

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const mmrValue = input.value.trim();

    if (!/^[0-9]+$/.test(mmrValue)) {
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("invalid-mmr")) {
            input.insertAdjacentElement("afterend", invalidSpan);
        }
        rankInfo.classList.add("hidden");
        return;
    }

    if (input.nextElementSibling && input.nextElementSibling.classList.contains("invalid-mmr")) {
        input.nextElementSibling.remove();
    }

    const mmr = parseInt(mmrValue, 10);
    let currentRank = null;
    let nextRank = null;

    for (let i = 0; i < ranks.length; i++) {
        for (let j = 0; j < ranks[i].mmr.length; j++) {
            if (mmr >= ranks[i].mmr[j]) {
                currentRank = { name: ranks[i].name, level: j + 1, mmr: ranks[i].mmr[j] };
                nextRank = ranks[i].mmr[j + 1] ? { name: ranks[i].name, level: j + 2, mmr: ranks[i].mmr[j + 1] } : (ranks[i + 1] ? { name: ranks[i + 1].name, level: 1, mmr: ranks[i + 1].mmr[0] } : null);
            }
        }
    }

    if (mmr >= 6500) {
        currentRank = { name: "Immortal", level: null, mmr: mmr };
        nextRank = null;
    }

    updateRankInfo(currentRank, nextRank, mmr);
});

function updateRankInfo(current, next, mmr) {
    document.querySelector(".current-rank-name").textContent = `${current.name} ${current.level ? romanize(current.level) : ''}`;
    document.querySelector(".current-rank-mmr").textContent = `${current.mmr} MMR`;
    document.querySelector(".current-rank-image").src = `./img/${current.name.toLowerCase()}${current.name === 'Immortal' ? '' : '-' + current.level}.webp`;

    if (current.name === "Immortal") {
        document.querySelector(".next-rank").classList.add("hidden");
        document.querySelector(".current-rank").classList.add("immortal");
        document.querySelector(".next-rank-info-your-mmr").textContent = `You have ${mmr} MMR`;
        document.querySelector(".next-rank-info-next-mmr").classList.add("hidden");
        document.querySelector(".next-rank-info-mmr-needed").textContent = "There isn't a higher rank";
        document.querySelector(".next-rank-info-games-needed").classList.add("hidden");
    } else {
        document.querySelector(".next-rank").classList.remove("hidden");
        document.querySelector(".current-rank").classList.remove("immortal");
        document.querySelector(".next-rank-info-next-mmr").classList.remove("hidden");
        document.querySelector(".next-rank-info-games-needed").classList.remove("hidden");

        document.querySelector(".next-rank-name").textContent = `${next.name} ${current.mmr < 5420 ? romanize(next.level) : ""}`;
        document.querySelector(".next-rank-mmr").textContent = `${next.mmr} MMR`;
        document.querySelector(".next-rank-image").src = `./img/${next.name.toLowerCase()}-${next.level}.webp`;

        const mmrNeeded = next.mmr - mmr;
        document.querySelector(".next-rank-info-your-mmr").textContent = `You have ${mmr} MMR`;
        document.querySelector(".next-rank-info-next-mmr").textContent = `${next.name} ${current.mmr < 5420 ? romanize(next.level) : ""} is at ${next.mmr} MMR`;
        document.querySelector(".next-rank-info-mmr-needed").innerHTML = `You need <span>${mmrNeeded} MMR</span>`;
        document.querySelector(".next-rank-info-games-needed").innerHTML = `You need to win approx <span>${Math.ceil(mmrNeeded / 25)} games</span>`;
    }

    rankInfo.classList.remove("hidden");
}

function romanize(num) {
    const roman = ["I", "II", "III", "IV", "V"];
    return roman[num - 1];
}
