let frame = 0;
let state = "IDLE";
let left = 300;
let leftArrow = false;
let rightArrow = false;
let attack = false;
let attacking = false;
let enemyCount = 100;
let enemies = [];
let bullets = [];
let backgroundMusic = new Audio('sounds/background_music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;
let hit = new Audio('sounds/hit.mp3');
let shot = new Audio('sounds/shot.mp3');
let walk = new Audio('sounds/walk.mp3');
walk.loop = true;
walk.volume = 1;
let gameOver = new Audio('sounds/game_over.mp3');

setInterval(moveCharacterAndEnemies, 75);
setInterval(updateGame, 13);

function updateGame() {
    if (state !== "DIE") {
        currentBackground.style.left = `${-left}px`;
        currentBackground2.style.left = `${-(left - currentBackground.width + 1)}px`;
        currentBackground3.style.left = `${-(left - currentBackground.width * 2 + 2)}px`;

        enemies.forEach(enemy => {
            if (!enemy.hit) {
                enemy.initialX -= 0.5;
            }
            enemy.element.style.left = `${enemy.initialX - left}px`;

        })
        bullets.forEach(bullet => {
            bullet.initialX += 15;
            bullet.element.style.left = `${bullet.initialX}px`;
        })
        if (leftArrow && left > 0) {
            left -= 5;
        }
        if (rightArrow && left < 1825) {
            left += 5;
        }
        if (attacking) {
            setState("ATTACK");
        } else if (leftArrow || rightArrow) {
            setState("WALK");
        } else {
            setState("IDLE");
        }
    }
    checkCollision();
    checkCharacterCollision();


}

function moveCharacterAndEnemies() {
    if (state !== "DIE") {
        updateEnemies();
    }
    if (state === "DIE" && frame < 7) {
        pirate.src = `img/2/2_entity_000_DIE_00${frame}.png`;
        frame++;
        backgroundMusic.pause();
        walk.pause();
        gameOver.play();
        setTimeout(() => {alert("You lost!")
            location.reload();
        }, 2000);

    } else if (state !== "DIE") {
        pirate.src = `img/2/2_entity_000_${state}_00${frame}.png`;
        frame++;

        if (frame === 7) {
            attacking = false;
            frame = 0;
        }
        if (leftArrow) {
            pirate.style.transform = "scaleX(-1)";
        }
        if (rightArrow) {
            pirate.style.transform = "scaleX(1)";
        }
    }

}
function updateEnemies() {
    enemies.forEach(enemy => {
        if (enemy.hit) {
            if (enemy.frame < 10) {
                enemy.element.src = `img/Minotaur_0${enemy.type}/Minotaur_0${enemy.type}_Dying_00${enemy.frame}.png`;
            } else {
                enemy.element.src = `img/Minotaur_0${enemy.type}/Minotaur_0${enemy.type}_Dying_0${enemy.frame}.png`;
            }
            enemy.frame++;
            if (enemy.frame > 14) {
                enemy.frame = 14;
            }
        } else {
            if (enemy.frame < 10) {
                enemy.element.src = `img/Minotaur_0${enemy.type}/Minotaur_0${enemy.type}_Walking_00${enemy.frame}.png`;
            } else {
                enemy.element.src = `img/Minotaur_0${enemy.type}/Minotaur_0${enemy.type}_Walking_0${enemy.frame}.png`;
            }
            enemy.frame++;
            if (enemy.frame === 18) {
                enemy.frame = 0;
            }
        }
    })
    if (leftArrow || rightArrow) {
        if (walk.paused) {
            walk.currentTime = 0;
            walk.play();
        }
    } else {
        walk.pause();
    }
}
function setState(newState) {
    if (state !== newState) {
        frame = 0;
        state = newState;
    }
}

document.onkeydown = checkKey;
document.onkeyup = uncheckKey;



function checkKey(e) {
    e = e || window.event;

    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }

    if (e.keyCode == '37') {
        leftArrow = true;
        // left arrow
    } else if (e.keyCode == '39') {
        rightArrow = true;
        // right arrow
    } else if (e.keyCode == '68') {
        startAttack();
        // 'D' key for attack
    }
}
function uncheckKey(e) {
    e = e || window.event;

    if (e.keyCode == '37') {
        leftArrow = false;
        // left arrow
    } else if (e.keyCode == '39') {
        rightArrow = false;
        // right arrow
    }
}

function startAttack() {
    attacking = true;
    setTimeout(() => {
        shot.currentTime = 0;
        shot.play();
        const bullet = document.createElement("img");
        bullet.classList.add("bullet");
        bullet.src = 'img/bullet.png';
        document.body.appendChild(bullet);
        bullets.push({
            element: bullet,
            initialX: 280,
        });

    }, 400);

}
createEnemies();

function createEnemies() {
    for (let i = 0; i < enemyCount; i++) {
        const enemyType = Math.floor(Math.random() * 3 + 1); // Randomly choose between 1 and 3 enemy types
        const enemy = document.createElement("img");
        enemy.classList.add("enemy");
        enemy.src = `img/Minotaur_0${enemyType}/Minotaur_0${enemyType}_Walking_000.png`;
        document.getElementById("enemiesContainer").appendChild(enemy);
        enemies.push({
            element: enemy,
            initialX: 800 + i * 600 * Math.random(),
            frame: i % 17,
            type: enemyType
        });
    }
}
function checkCollision() {
    enemies.forEach(enemy => {
        if (!enemy.hit) {
            bullets.forEach((bullet, bulletIndex) => {
                const enemyRect = enemy.element.getBoundingClientRect();
                const bulletRect = bullet.element.getBoundingClientRect();
                if (bulletRect.left < enemyRect.right && bulletRect.right > enemyRect.left) {
                    hit.currentTime = 0;
                    hit.play();
                    enemy.hit = true;
                    enemy.frame = 5;
                    bullet.element.remove();
                    bullets.splice(bulletIndex, 1);
                }
            })
        }
    })
}
function checkCharacterCollision() {
    if (state === "DIE") return;
    const pirateRect = pirate.getBoundingClientRect();
    enemies.forEach(enemy => {
        if (!enemy.hit) {
            const enemyRect = enemy.element.getBoundingClientRect();
            if (pirateRect.left < enemyRect.right && pirateRect.right > enemyRect.left) {
                setState("DIE")
                leftArrow = false;
                rightArrow = false;
                enemies.forEach(enemy => {
                    enemy.moveable = false;
                })
            }
        }
    })
}