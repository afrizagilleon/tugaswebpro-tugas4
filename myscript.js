// numbers
var button_1 = document.getElementById("button_1");
var button_2 = document.getElementById("button_2");
var button_3 = document.getElementById("button_3");
var button_4 = document.getElementById("button_4");
var button_5 = document.getElementById("button_5");
var button_6 = document.getElementById("button_6");
var button_7 = document.getElementById("button_7");
var button_8 = document.getElementById("button_8");
var button_9 = document.getElementById("button_9");
var button_0 = document.getElementById("button_0");

// operand
var plus = document.getElementById("button_plus");
var minus = document.getElementById("button_minus");
var multiply = document.getElementById("button_multiply");
var divide = document.getElementById("button_divide");
var equal = document.getElementById("button_equals");
var percent = document.getElementById("button_percent");

// the other button
var parenthesesButton = document.getElementById("button_parentheses");
var comma = document.getElementById("button_comma");
var information = document.getElementById("information");

// add comma
comma.addEventListener("click", () => {
  if (expressions[currentPos].includes(".")) {
    // mencegah double comma
    return;
  }

  if (expressions[currentPos] === "") {
    expressions[currentPos] = "0";
  }

  expressions[currentPos] = (expressions[currentPos] || "") + ".";
  updateDisplay();
});

// add parentheses
parenthesesButton.addEventListener("click", () => {
  const current = expressions[currentPos];
  const isNumber = !isNaN(current) && current !== "";
  const isOperator = ["+", "-", "*", "/"].includes(current);
  const hasUnclosedParentheses = parentheses.open > parentheses.close;

  // Case 1: Posisi kosong atau setelah operator → buka kurung
  if (current === "" || isOperator) {
    if (isOperator) currentPos++;
    expressions[currentPos] = "(";
    expressions[currentPos + 1] = "";
    currentPos++;
    parentheses.open++;
    updateDisplay();
    return;
  }

  // Case 2: Setelah angka/persen
  if (isNumber || current.endsWith("%")) {
    if (hasUnclosedParentheses) {
      // Tutup kurung
      expressions[currentPos + 1] = ")";
      currentPos++;
      parentheses.close++;
    } else {
      // Buka kurung baru dengan perkalian
      expressions[currentPos + 1] = "*";
      expressions[currentPos + 2] = "(";
      expressions[currentPos + 3] = "";
      currentPos += 3;
      parentheses.open++;
    }
    updateDisplay();
    return;
  }

  // Case 3: Setelah kurung tutup
  if (current === ")") {
    if (hasUnclosedParentheses) {
      expressions[currentPos + 1] = ")";
      currentPos++;
      parentheses.close++;
    } else {
      expressions[currentPos + 1] = "*";
      expressions[currentPos + 2] = "(";
      expressions[currentPos + 3] = "";
      currentPos += 3;
      parentheses.open++;
    }
    updateDisplay();
    return;
  }
});

// calculation output
var calculation_input = document.getElementById("calculation_input");
var calculation_preview = document.getElementById("calculation_preview");
var clear = document.getElementById("button_clear");
var backspace = document.getElementById("button_backspace");

// history els
var historyButton = document.getElementById("button_history");
var historyDeleteButton = document.getElementById('deleteHistory');
var historyIcon = document.getElementById("button_history");
var historyCon = document.getElementById("calc_history_container");
var historyList = document.getElementById("calc_history_list");
var historyClose = document.getElementById("closeHistory");

// s
const soundClick = new Audio("sounds/click.mp3");
const soundSwipe = new Audio("sounds/swipe.mp3");

const playSoundClick = () => {
  soundClick.currentTime = 0.25;
  soundClick.play();
};

const playSoundSwipe = () => {
  soundSwipe.currentTime = 0.1;
  soundSwipe.volume = 0.2;
  soundSwipe.play();
};

// storage
// var expressions = [""];
expressions = [""];
var result = 0;
var currentPos = 0;
var parentheses = {
  open: 0,
  close: 0,
};
const state = {
  showResult: "show",
  input: "input",
};
var currentState = state.input;

/** @type {Array<{input: string, hasil: string}>} */
var calc_history = JSON.parse(localStorage.getItem('calc_history') || '[]');

document.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
  updateHistory();
  const elementB = document.getElementById("buttons_container");
  const offSetTopB = elementB.offsetTop;
  const offsetHeight = elementB.offsetHeight;
  document.documentElement.style.setProperty(
    "--offsetHeightB",
    `${offsetHeight}px`
  );
  document.documentElement.style.setProperty("--offsetTopB", `${offSetTopB}px`);
});

clear.addEventListener("click", () => {
  expressions = [""];
  result = 0;
  currentPos = 0;
  updateDisplay();
  if(currentState === state.showResult) toggleState();
});

backspace.addEventListener("click", () => {
  const currentEx = expressions[currentPos];

  if (currentState === state.showResult) toggleState();

  if (currentEx === ")" || currentEx === "("){
    expressions.pop();
    currentPos--;
    updateDisplay();
    return;
  }

  // cegah menghapus 0
  if (currentEx === "" && currentPos === 0) return;

  // hapus operand
  if (currentEx === "" && currentPos !== 0) {
    expressions.pop();
    currentPos -= 2;
    expressions.pop();
    updateDisplay();
    return;
  }

  // hapus secara normal
  expressions[currentPos] = currentEx.slice(0, -1);
  updateDisplay();
});

function updateDisplay() {
  playSoundClick();
  let temp = "";
  expressions.forEach((ex) => {
    if (ex.endsWith(".")) {
      temp += ex.slice(0, -1) + ",";
      return;
    }

    if (Number(ex)) {
      temp += Intl.NumberFormat("id-ID").format(ex);
    } else if (ex === "*") {
      temp += "x";
    } else if (ex === "" && temp === "") {
      temp += 0;
    } else {
      temp += ex;
    }
  });

  calculate(expressions);
  calculation_input.innerHTML = temp;
  calculation_preview.innerHTML = Intl.NumberFormat("id-ID").format(result);
  console.log("current expressions:", expressions);
  calculation_input.scrollTop = calculation_input.scrollHeight;

  // recount the parentheses
  parentheses.open = 0;
  parentheses.close = 0;
  expressions.forEach((ex) => {
    if (ex === "(") {
      parentheses.open++;
    } else if (ex === ")") {
      parentheses.close++;
    }
  });
}

// number buttons
var number_buttons = [
  button_0,
  button_1,
  button_2,
  button_3,
  button_4,
  button_5,
  button_6,
  button_7,
  button_8,
  button_9,
];
number_buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (currentState === state.showResult) toggleState();
    if (expressions[currentPos].endsWith("%")) return; // cegah percent

    if (expressions[currentPos].length > 8) return;

    expressions[currentPos] = (expressions[currentPos] || "") + index;
    updateDisplay();
  });
});

percent.addEventListener("click", () => {
  const currentEx = expressions[currentPos];
  if (currentEx.endsWith("%")) {
    return;
  }

  if (currentEx === "") {
    return;
  }
  expressions[currentPos] += "%";
  updateDisplay();
});

// operand buttons
var operand_buttons = [plus, minus, multiply, divide];
var operations = ["+", "-", "*", "/"];
operand_buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // kembali ke input mode
    if(currentState === state.showResult) toggleState()
    
    // cegah jika sebelumnya adalah operand
    if (expressions[currentPos] === "") return;

    // cegah jika terdapat comma
    if (expressions[currentPos].endsWith(".")) return;

    expressions.push(operations[index]);
    currentPos++;
    expressions.push("");
    currentPos++;
    updateDisplay();
  });
});

function calculate(expressions) {
  let convertedExp = [];

  for (let i = 0; i < expressions.length; i++) {
    const ex = expressions[i];

    if (ex.endsWith("%")) {
      const num = parseFloat(ex.slice(0, -1));

      if (i >= 2 && convertedExp.length >= 2) {
        const prevResult = operateCalculate(convertedExp.slice(0, i - 1));
        const percentValue = prevResult * (num / 100);
        convertedExp.push(percentValue);
      } else {
        convertedExp.push(num / 100);
      }
    } else if (ex === "(" || ex === ")") {
      // Tambahkan parentheses langsung
      convertedExp.push(ex);
    } else {
      const converted = parseFloat(ex);
      if (converted || converted === 0) {
        convertedExp.push(converted);
      } else if (ex === "") {
        convertedExp.push(0);
      } else {
        convertedExp.push(ex); // Operator
      }
    }
  }

  console.log("converted:", convertedExp);
  result = operateCalculate(convertedExp);
}

function operateCalculate(expr) {
  let calc = [...expr];

  // Step 1: Proses parentheses dari dalam ke luar
  while (calc.includes("(")) {
    // Cari pasangan kurung terdalam
    let openIndex = -1;
    let closeIndex = -1;

    for (let i = 0; i < calc.length; i++) {
      if (calc[i] === "(") {
        openIndex = i; // Update setiap kali ketemu '('
      } else if (calc[i] === ")") {
        closeIndex = i;
        break; // Kurung tutup pertama setelah '(' terakhir
      }
    }

    if (closeIndex === -1) {
      console.error("Kurung tidak berpasangan!");
      break; // Keluar dari loop
    }

    // Ekstrak isi kurung
    const innerExpr = calc.slice(openIndex + 1, closeIndex);

    // Hitung isi kurung (rekursif)
    const innerResult = operateCalculate(innerExpr);

    // Replace kurung dengan hasil
    calc.splice(openIndex, closeIndex - openIndex + 1, innerResult);
  }

  // Step 2: Proses */ lalu +-
  ["*/", "+-"].forEach((ops) => {
    for (let i = 1; i < calc.length; i += 2) {
      if (ops.includes(calc[i])) {
        let result;
        if (calc[i] === "*") result = calc[i - 1] * calc[i + 1];
        else if (calc[i] === "/") result = calc[i - 1] / calc[i + 1];
        else if (calc[i] === "+") result = calc[i - 1] + calc[i + 1];
        else if (calc[i] === "-") result = calc[i - 1] - calc[i + 1];

        calc.splice(i - 1, 3, result);
        i -= 2;
      }
    }
  });

  return calc[0];
}

information.addEventListener("click", () => {
  alert(
    "This is a simple calculator created for a website programming course. By Afriza Gilleon Ginting"
  );
});

function toggleState() {
  if (currentState === state.input) {
    currentState = state.showResult;
  } else {
    currentState = state.input;
  }

  if (currentState === state.showResult) {
    calculation_input.classList.add("showResult");
    calculation_preview.classList.add("showResult");
  } else {
    calculation_input.classList.remove("showResult");
    calculation_preview.classList.remove("showResult");
  }
}

equal.addEventListener("click", () => {
  if (currentState === state.input) toggleState();
  calc_history.push({
    input: calculation_input.innerHTML,
    hasil: calculation_preview.innerHTML,
  });
  
  // restart expressions
  expressions = [result.toString()];
  currentPos = 0;
  updateDisplay();
  updateHistory();
  console.log(calc_history);
});


historyClose.addEventListener("click", () => {
  historyCon.classList.remove("openHistory");
  historyCon.classList.add("closeHistory");
  playSoundSwipe();
});

historyButton.addEventListener("click", () => {
  historyCon.classList.remove("closeHistory");
  if(!historyCon.classList.contains("openHistory")) playSoundSwipe();
  historyCon.classList.add("openHistory");
});

function parseExpression(str) {
    // Hapus titik sebagai pemisah ribuan
    const cleaned = str.replace(/\./g, '');
    return cleaned.match(/(\d+%?|[+\-×÷*/])/g);
}


function updateHistory() {
  historyList.innerHTML = "";
  calc_history.toReversed().forEach((item, index) => {
    const temp = `
<div class="calc_history_item">
  <div class="calc_history_input"> ${item.input}</div>
  <div class="calc_history_result">= ${item.hasil}</div>
</div>
    `;
    historyList.innerHTML += temp;
  });

  // Simpan ke localStorage
  localStorage.setItem('calc_history', JSON.stringify(calc_history));

  attachHistoryInputListener();
  attachHistoryResultListener();
}

updateHistory();


function attachHistoryInputListener() {
  document.querySelectorAll(".calc_history_input").forEach((el) => {
    el.addEventListener("click", (e) => {
      expressions = parseExpression(e.target.innerHTML);

      // convert x to *
      expressions = expressions.map((ex) => {
        if (ex === "x") return "*";
        return ex;
      });
      currentPos = expressions.length - 1;
      console.log(expressions, "oke");

      updateDisplay();
      console.log(e.target.innerHTML);
      if(currentState === state.showResult) toggleState();

    });
  });
}

function attachHistoryResultListener() {
  document.querySelectorAll(".calc_history_result").forEach((el) => {
    el.addEventListener("click", (e) => {
      expressions = parseExpression(e.target.innerHTML);

      // convert x to *
      expressions = expressions.map((ex) => {
        if (ex === "x") return "*";
        return ex;
      });
      currentPos = expressions.length - 1;
      console.log(expressions, "oke");

      updateDisplay();
      console.log(e.target.innerHTML);
      if(currentState === state.showResult) toggleState();
    });
  });
}


historyDeleteButton.addEventListener("click", () => {
  const deleteConfirm = confirm("Are you sure you want to delete all history?")
  if(!deleteConfirm) return;
  localStorage.removeItem('calc_history');
  calc_history = [];
  updateHistory();
});
