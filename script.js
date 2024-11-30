// script.js

// Itens padrão da Ordem do Culto
const defaultOrder = [
  { title: "Abertura e Oração", observation: "" },
  { title: "Louvor e Adoração", observation: "" },
  { title: "Leitura Bíblica", observation: "" },
  { title: "Mensagem", observation: "" },
  { title: "Encerramento", observation: "" },
];

// Data Estruturada com Valores Padrão
let programData = {
  programName: "Programação do Culto",
  programDate: "", // Será preenchido com a data atual
  songsList: [],
  orderList: [],
};
let currentSongIndex = null; // Índice da música atualmente aberta
let currentFilename = ""; // Nome do arquivo atualmente importado

// Atualizar a data no campo de data e exibição
function initializeDate() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  if (!programData.programDate) {
    programData.programDate = formattedDate;
  }
  document.getElementById("programDate").value = programData.programDate;
  updateCurrentDateDisplay();
}

// Atualizar a exibição da data
function updateCurrentDateDisplay() {
  const display = document.getElementById("currentDateDisplay");
  const date = new Date(programData.programDate);
  const options = { year: "numeric", month: "long", day: "numeric" };
  display.textContent = date.toLocaleDateString("pt-BR", options);
}

// Função para adicionar música
function addMusic() {
  const musicPdfInput = document.getElementById("musicPdf");

  if (musicPdfInput.files.length > 0) {
    const file = musicPdfInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const song = {
        name: file.name.replace(".pdf", ""), // Extrai o nome do arquivo sem a extensão
        pdfData: e.target.result,
        notes: "", // Inicializa as notas vazias
      };
      programData.songsList.push(song);
      saveProgramData(); // Salvar após adicionar
      updateMusicList();
      musicPdfInput.value = ""; // Limpa o input após adicionar
    };
    reader.readAsDataURL(file);
  }
}

// Função para salvar o programa no localStorage
function saveProgramData() {
  // Capturar Nome da Programação
  const nameInput = document.getElementById("programName").value.trim();
  if (nameInput === "") {
    alert("O nome da programação não pode estar vazio.");
    return;
  }

  // Capturar Data da Programação
  const dateInput = document.getElementById("programDate").value;
  if (!dateInput) {
    alert("Por favor, selecione uma data válida.");
    return;
  }

  // Atualizar programData
  programData.programName = nameInput;
  programData.programDate = dateInput;

  // Atualizar Observações na Ordem do Culto
  programData.orderList.forEach((item, index) => {
    const textarea = document.querySelector(
      `#orderList .order-item:nth-child(${index + 1}) textarea`
    );
    if (textarea) {
      programData.orderList[index].observation = textarea.value.trim();
    }
  });

  // Atualizar Observações nas Músicas (Caso alguma esteja aberta)
  if (currentSongIndex !== null) {
    const notesTextarea = document.getElementById("instrumentalistNotes");
    if (notesTextarea) {
      programData.songsList[currentSongIndex].notes =
        notesTextarea.value.trim();
    }
  }

  // Salvar no localStorage
  localStorage.setItem("churchProgram", JSON.stringify(programData));
  showNotification("Dados salvos com sucesso!");
}

// Função para carregar o programa do localStorage
function loadProgram() {
  const savedProgram = localStorage.getItem("churchProgram");
  if (savedProgram) {
    programData = JSON.parse(savedProgram);
  } else {
    programData.orderList = JSON.parse(JSON.stringify(defaultOrder)); // Clone do defaultOrder
  }
}

// Função para atualizar a lista de músicas na interface
function updateMusicList() {
  const container = document.getElementById("musicList");
  container.innerHTML = "";

  programData.songsList.forEach((song, index) => {
    const div = document.createElement("div");
    div.className =
      "music-link p-3 rounded-lg border border-gray-200 flex items-center justify-between bg-gray-100 hover:bg-gray-200";
    div.setAttribute("draggable", true);
    div.setAttribute("ondragstart", "dragMusic(event)");
    div.setAttribute("data-index", index);

    const nameSpan = document.createElement("span");
    nameSpan.className =
      "text-gray-700 hover:text-indigo-600 cursor-pointer font-semibold flex items-center";
    nameSpan.innerHTML = `<i class="fas fa-file-pdf mr-2 text-red-500"></i>${song.name}`;
    nameSpan.onclick = () => {
      showPdf(song, index);
    };

    const deleteButton = document.createElement("button");
    deleteButton.className =
      "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded-lg transition duration-300 flex items-center";
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.onclick = () => {
      deleteSong(index);
    };

    div.appendChild(nameSpan);
    div.appendChild(deleteButton);
    container.appendChild(div);
  });
}

// Função para mostrar o PDF no visualizador integrado
function showPdf(song, index) {
  currentSongIndex = index; // Atualiza o índice da música atual
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfTitle = document.querySelector("#pdfViewerSection h2");
  const notesTextarea = document.getElementById("instrumentalistNotes");

  pdfTitle.innerHTML = `<i class="fas fa-file-pdf mr-2 text-red-500"></i> ${song.name}`;
  pdfViewer.src = song.pdfData;
  notesTextarea.value = song.notes || ""; // Evita 'undefined'

  // Opcional: Focar no textarea
  notesTextarea.focus();
}

// Função para salvar as observações das músicas
function saveNotes() {
  if (currentSongIndex !== null) {
    const notesTextarea = document.getElementById("instrumentalistNotes");
    programData.songsList[currentSongIndex].notes = notesTextarea.value.trim();
    saveProgramData(); // Salvar após editar notas
    showNotification("Observações da música atualizadas!");
  }
}

// Função para exibir notificação de sucesso
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
  notification.classList.remove("opacity-0");
  notification.classList.add("opacity-100");

  setTimeout(() => {
    notification.classList.remove("opacity-100");
    notification.classList.add("opacity-0");
  }, 3000); // Esconde após 3 segundos
}

// Função para deletar uma música
function deleteSong(index) {
  if (confirm("Tem certeza que deseja excluir esta música?")) {
    programData.songsList.splice(index, 1);
    saveProgramData(); // Salvar após deletar
    updateMusicList();

    // Limpar visualizador se a música deletada estava aberta
    if (currentSongIndex === index) {
      clearPdfViewer();
    } else if (currentSongIndex > index) {
      currentSongIndex--; // Ajustar índice se necessário
    }
  }
}

// Função para limpar o visualizador de PDF
function clearPdfViewer() {
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfTitle = document.querySelector("#pdfViewerSection h2");
  const notesTextarea = document.getElementById("instrumentalistNotes");

  pdfViewer.src = "";
  pdfTitle.innerHTML = `<i class="fas fa-file-pdf mr-2 text-red-500"></i> Visualizador de Cifras`;
  notesTextarea.value = "";

  currentSongIndex = null; // Reseta o índice da música atual
}

// Função para exportar o programa
function exportProgram() {
  // Salvar os dados atuais antes de exportar
  saveProgramData();

  const dataStr = JSON.stringify(programData, null, 4);
  let exportFilename = "programa_culto.json"; // Nome padrão

  if (currentFilename !== "") {
    exportFilename = currentFilename;
  }

  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFilename);
  document.body.appendChild(linkElement); // Firefox requer que o elemento esteja no DOM
  linkElement.click();
  document.body.removeChild(linkElement);

  showNotification("Programação exportada com sucesso!");
}

// Função para importar o programa
function importProgram(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedProgram = JSON.parse(e.target.result);
        // Validações flexíveis com valores padrão
        programData.programName =
          importedProgram.programName || "Programação do Culto";
        programData.programDate =
          importedProgram.programDate || new Date().toISOString().split("T")[0];
        programData.songsList = Array.isArray(importedProgram.songsList)
          ? importedProgram.songsList
          : [];
        programData.orderList = Array.isArray(importedProgram.orderList)
          ? importedProgram.orderList
          : JSON.parse(JSON.stringify(defaultOrder));

        document.getElementById("programName").value = programData.programName;
        document.getElementById("programDate").value = programData.programDate;
        updateCurrentDateDisplay();
        updateMusicList();
        updateOrderList();

        // Atualizar o nome do arquivo importado
        currentFilename = file.name.endsWith(".json")
          ? file.name
          : `${file.name}.json`;
        document.getElementById("currentFilename").textContent =
          currentFilename;

        // Salvar os dados importados no localStorage
        localStorage.setItem("churchProgram", JSON.stringify(programData));

        showNotification("Programa importado com sucesso!");

        // Limpar visualizador se houver
        clearPdfViewer();
      } catch (error) {
        alert(
          "Erro ao importar o programa. Verifique se o arquivo está correto."
        );
        console.error(error);
      }
    };
    reader.readAsText(file);
  }
}

// Função para zerar a programação
function resetProgram() {
  if (confirm("Tem certeza que deseja zerar toda a programação?")) {
    programData.programName = "Programação do Culto";
    programData.programDate = new Date().toISOString().split("T")[0]; // Define a data atual
    programData.songsList = [];
    programData.orderList = JSON.parse(JSON.stringify(defaultOrder)); // Reset para os padrões
    currentFilename = ""; // Resetar o nome do arquivo importado
    document.getElementById("currentFilename").textContent =
      "Nenhum arquivo carregado";

    // Salvar no localStorage
    localStorage.setItem("churchProgram", JSON.stringify(programData));

    // Atualizar a interface
    document.getElementById("programName").value = programData.programName;
    document.getElementById("programDate").value = programData.programDate;
    updateCurrentDateDisplay();
    updateMusicList();
    updateOrderList();

    // Limpar visualizador se houver
    clearPdfViewer();

    showNotification("Programação zerada com sucesso!");
  }
}

// Funções de arrastar e soltar para músicas
function allowDrop(event) {
  event.preventDefault();
}

function dragMusic(event) {
  const index = event.currentTarget.getAttribute("data-index");
  event.dataTransfer.setData("text/plain", index);
}

function dropMusic(event) {
  event.preventDefault();
  const fromIndex = parseInt(event.dataTransfer.getData("text/plain"));
  let toElement = event.target.closest(".music-link");
  if (toElement) {
    const toIndex = parseInt(toElement.getAttribute("data-index"));
    if (fromIndex === toIndex) return; // Sem mudança

    const movedSong = programData.songsList.splice(fromIndex, 1)[0];
    programData.songsList.splice(toIndex, 0, movedSong);
    saveProgramData(); // Salvar após movimentar
    updateMusicList();
  }
}

// Funções de arrastar e soltar para Ordem do Culto
function dragOrder(event) {
  const index = event.currentTarget.getAttribute("data-index");
  event.dataTransfer.setData("text/plain", index);
}

function dropOrder(event) {
  event.preventDefault();
  let targetElement = event.target.closest(".order-item");
  if (!targetElement) return;

  const fromIndex = parseInt(event.dataTransfer.getData("text/plain"));
  const toIndex = parseInt(targetElement.getAttribute("data-index"));

  if (fromIndex === toIndex) return; // Sem mudança

  const movedItem = programData.orderList.splice(fromIndex, 1)[0];
  programData.orderList.splice(toIndex, 0, movedItem);
  saveProgramData(); // Salvar após movimentar
  updateOrderList();
}

// Função para atualizar a lista da Ordem do Culto na interface
function updateOrderList() {
  const container = document.getElementById("orderList");
  container.innerHTML = "";

  programData.orderList.forEach((item, index) => {
    const div = document.createElement("div");
    div.className =
      "order-item flex flex-col md:flex-row items-start md:items-center p-3 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200";
    div.setAttribute("draggable", true);
    div.setAttribute("ondragstart", "dragOrder(event)");
    div.setAttribute("data-index", index);

    // Número da ordem
    const numberSpan = document.createElement("span");
    numberSpan.className =
      "w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full mr-3";
    numberSpan.textContent = index + 1;

    // Título do item
    const titleSpan = document.createElement("span");
    titleSpan.className = "text-lg font-semibold flex-grow";
    titleSpan.textContent = item.title;

    // Caixa de observação
    const textarea = document.createElement("textarea");
    textarea.className =
      "ml-4 border rounded p-1 w-full mt-2 md:mt-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200";
    textarea.placeholder = "Observações...";
    textarea.value = item.observation || ""; // Evita 'undefined'
    textarea.oninput = () => {
      programData.orderList[index].observation = textarea.value.trim();
      saveProgramData(); // Salvar em tempo real ao editar observações
    };

    div.appendChild(numberSpan);
    div.appendChild(titleSpan);
    div.appendChild(textarea);
    container.appendChild(div);
  });
}

// Função para inicializar a aplicação
window.onload = function () {
  loadProgram();
  initializeDate();
  document.getElementById("programName").value = programData.programName;
  document.getElementById("programDate").value = programData.programDate;
  updateCurrentDateDisplay();
  updateMusicList();
  updateOrderList();

  // Atualizar o nome do arquivo importado no display
  document.getElementById("currentFilename").textContent =
    currentFilename === "" ? "Nenhum arquivo carregado" : currentFilename;
};

// script.js

// Função para alternar o modo de tela cheia no Visualizador de PDF
function toggleFullScreen() {
  const pdfSection = document.getElementById("pdfViewerSection");

  if (!document.fullscreenElement) {
    // Solicitar tela cheia
    if (pdfSection.requestFullscreen) {
      pdfSection.requestFullscreen();
    } else if (pdfSection.webkitRequestFullscreen) {
      /* Safari */
      pdfSection.webkitRequestFullscreen();
    } else if (pdfSection.msRequestFullscreen) {
      /* IE11 */
      pdfSection.msRequestFullscreen();
    }
  } else {
    // Sair da tela cheia
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  }
}

// Opcional: Atualizar o ícone do botão baseado no estado de tela cheia
document.addEventListener("fullscreenchange", () => {
  const fullscreenButton = document.querySelector("#pdfViewerSection button");
  if (document.fullscreenElement) {
    fullscreenButton.innerHTML = '<i class="fas fa-compress-alt"></i>';
  } else {
    fullscreenButton.innerHTML = '<i class="fas fa-expand-alt"></i>';
  }
});
