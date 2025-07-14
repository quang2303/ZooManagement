function handleAjaxError(xhr, status, error) {
	let message = "⚠️ Something went wrong";

	console.log(xhr)

	if (xhr.responseJSON) {
		const res = xhr.responseJSON;

		if (res.error) {
			message = res.error;
		} else if (res.errors && Array.isArray(res.errors)) {
			message = res.errors.join("<br>");
		} else if (res.message) {
			message = res.message;
		}
	} else if (xhr.status === 500) {
		message = "💥 Internal server error.";
	} else if (xhr.responseText) {
		message = xhr.responseText;
	}

	showToast("error", message);
}

function handleNotFound(xhr, fallbackMessage = "❗ Don't have data to show!") {
	$("#animal-error").empty();

	if (xhr.status === 404) {
		const message = xhr.responseJSON && xhr.responseJSON.error
			? xhr.responseJSON.error
			: fallbackMessage;

		$("#animal-error").text(message);

		const tbody = $("#allanimal tbody");
		tbody.empty();
		renderPage(1);
		currentPage = 1;
		maxPage = 1;
		return;
	}

	handleAjaxError(xhr); // Nếu không phải 404 → dùng lỗi chung
}


function getIcon(species) {
	switch (species) {
		case "LION": return "🦁";
		case "ELEPHANT": return "🐘";
		case "PARROT": return "🦜";
		default: return "🐾";
	}
}

function showToast(typeClass, message) {
	const toast = $(`<div class="toast ${typeClass}">${message}</div>`);
	$("#toast-container").append(toast);

	setTimeout(() => {
		toast.fadeOut(300, () => toast.remove());
	}, 5000);
}

let size = 15;
let currentPage = 1;
let maxPage = 1

function renderPage(numPage) {
	$(".list-page").empty();
	for (let i = 1; i <= numPage; i++) {
		$(".list-page").append(`<a id="page-${i}" href="#">${i}</a>`)
	}
}

function renderAnimalPerPage(data) {
	const tbody = $("#allanimal tbody");
	tbody.empty();

	data.forEach(function(animal) {
		let extraInfo = "";

		if (animal.species === "ELEPHANT" && animal.weight != null) {
			extraInfo = `Weight: ${animal.weight} kg`;
		} else if (animal.species === "LION" && animal.speed != null) {
			extraInfo = `Speed: ${animal.speed} km/h`;
		} else if (animal.species === "PARROT" && animal.canTalk != null) {
			extraInfo = animal.canTalk ? "Can talk" : "Can't talk";
		}

		let icon = getIcon(animal.species);

		const row = `
			<tr>
			    <td title="${animal.id}">${animal.id}</td>
			    <td title="${animal.name}">${animal.name}</td>
			    <td title="${animal.age}">${animal.age}</td>
			    <td title="${animal.habitat}">${animal.habitat}</td>
			    <td title="${animal.species}">${icon + " " + animal.species}</td>
			    <td title="${extraInfo}">${extraInfo}</td>
			    <td title="${animal.timeAdd}">${animal.timeAdd}</td>
			</tr>
		      `;
		tbody.append(row);
	});

	let activePage = `#page-${currentPage}`;

	$(".list-page a").removeClass("active");
	$(activePage).addClass("active");
}

$(".left").on("click", function() {
	if (currentPage == 1) {
		return;
	}
	currentPage = currentPage - 1;
	renderAllAnimal();
})

$(".right").on("click", function() {
	if (currentPage == maxPage) {
		return;
	}
	currentPage = currentPage + 1;
	renderAllAnimal();
})

$(".list-page").on("click", "a", function() {
	let pageClick = parseInt($(this).text());
	if (currentPage == pageClick) {
		return;
	}
	currentPage = pageClick;
	renderAllAnimal();
})

let sortDirection = "asc";

function renderAllAnimal() {
	$.ajax({
		url: `http://localhost:8080/api/animals/page?size=${encodeURIComponent(size)}&page=${encodeURIComponent(currentPage - 1)}&direction=${sortDirection}`,
		method: "GET",
		beforeSend: function() {
			$(".block_loader").fadeIn(200);
		},
		success: function(data) {
			$("#animal-error").empty();
			showToast("success", "Load animal success!")
			renderPage(data.totalPages);
			renderAnimalPerPage(data.content);
			maxPage = data.totalPages;
		},
		error: function(xhr) {
			handleNotFound(xhr);
		},

		complete: function() {
			$(".block_loader").fadeOut(200);
		},
	});
}

$("#btn-sort").on("click", function() {
	sortDirection = (sortDirection === "desc") ? "asc" : "desc";
	renderAllAnimal();
});

function validate() {
	$(".note").remove();

	const name = $("#name").val().trim();
	const age = $("#age").val();
	const habitat = $("#habitat").val().trim();
	const species = $("#species").val();
	let isValid = true;

	if (name === "") {
		isValid = false;
		$("#name").closest(".form-group").append("<div class='note'>Please enter name animal.</div>");
	} else if (name.length > 100) {
		isValid = false;
		$("#name").closest(".form-group").append("<div class='note'>Max length name animal is 100.</div>");
	}

	if (age === "") {
		isValid = false;
		$("#age").closest(".form-group").append("<div class='note'>Please enter age animal.</div>");
	} else {
		const ageVal = parseInt(age);
		if (isNaN(ageVal) || ageVal < 0 || ageVal > 100) {
			isValid = false;
			$("#age").closest(".form-group").append("<div class='note'>Age between 0 and 100.</div>");
		}
	}

	if (habitat === "") {
		isValid = false;
		$("#habitat").closest(".form-group").append("<div class='note'>Please enter habitat animal.</div>");
	} else if (habitat.length > 100) {
		isValid = false;
		$("#habitat").closest(".form-group").append("<div class='note'>Max length habitat animal is 100.</div>");
	}

	if (species === "") {
		isValid = false;
		$("#species").closest(".form-group").append("<div class='note'>Please choose species animal.</div>");
	} else if (!["Elephant", "Lion", "Parrot"].includes(species)) {
		isValid = false;
		$("#species").closest(".form-group").append("<div class='note'>Wrong species animal.</div>");
	}

	return isValid;
}


function validAttribute(id) {
	$(".note").remove();
	if (id === "#weight") {
		let weight = $(id).val();
		if (weight === "") {
			$(id).after("<div class='note'>Please enter weight of elephant.</div>");
			return false;
		}
		if (parseFloat(weight) < 1 || parseFloat(weight) > 10000) {
			$(id).after("<div class='note'>Weight elephant must be between 1 and 10000.</div>");
			return false;
		}
	}
	else if (id === "#speed") {
		let speed = $(id).val();
		if (speed === "") {
			$(id).after("<div class='note'>Please enter speed of lion.</div>");
			return false;
		}
		if (parseFloat(speed) < 1 || parseFloat(speed) > 100) {
			$(id).after("<div class='note'>Speed elephant must be between 1 and 10000.</div>");
			return false;
		}
	}
	else if (id === "#canTalk") {
		let canTalk = $(id).val();
		if (canTalk != "true" && canTalk != "false") {
			$(id).after("<div class='note'>Please choose attribute for parrot.</div>");
			return false;
		}
	}

	return true;
}


$("#animalForm").submit(function(e) {
	e.preventDefault();

	if (validate()) {
		const dataAnimal = {
			name: $("#name").val(),
			age: parseInt($("#age").val()),
			habitat: $("#habitat").val(),
			species: $("#species").val().toUpperCase()
		};

		if ($("#weight").length) {
			if (!validAttribute("#weight")) {
				return;
			}
			dataAnimal.weight = parseFloat($("#weight").val());
		}
		if ($("#speed").length) {
			if (!validAttribute("#speed")) {
				return;
			}
			dataAnimal.speed = parseFloat($("#speed").val());
		}
		if ($("#canTalk").length) {
			if (!validAttribute("#canTalk")) {
				return;
			}
			dataAnimal.canTalk = $("#canTalk").val() === "true";
		}

		$.ajax({
			url: "http://localhost:8080/api/animals",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify(dataAnimal),
			beforeSend: function() {
				$(".block_loader").fadeIn(200);
			},
			success: function() {
				showToast("success", "Add animal success!")
				$("#animalForm")[0].reset();
				$("#dynamic-fields").empty();
			},
			error: handleAjaxError,

			complete: function() {
				$(".block_loader").fadeOut(200);
			},
		});
	} else {
		return;
	}
});

$("#delete-by-name-form").submit(function(e) {
	e.preventDefault();

	$(".note").remove();
	const name = $("#name-delete").val();
	if (name != "") {

		$.ajax({
			url: `http://localhost:8080/api/animals/delete/name?name=${encodeURIComponent(name)}`,
			method: "DELETE",
			beforeSend: function() {
				$(".block_loader").fadeIn(200);
			},
			success: function(data) {
				showToast("success", data)
				$("#delete-by-name-form")[0].reset();
				$(".note").remove();
				$("#modal-delete-name").hide();
				renderAllAnimal();
			},
			error: handleAjaxError,

			complete: function() {
				$(".block_loader").fadeOut(200);
			},
		});
	} else {
		$("#name-delete").after("<div class='note'>Please enter name animal</div>");
		showToast("error", "Wrong information")
	}
});

$("#delete-by-type-form").submit(function(e) {
	e.preventDefault();
	$(".note").remove();

	const species = $("#species-delete").val().toUpperCase();

	if (!species) {
		showToast("error", "Please choose a species to delete");
		return;
	}

	$.ajax({
		url: `http://localhost:8080/api/animals/delete/species?species=${encodeURIComponent(species)}`,
		method: "DELETE",
		beforeSend: function() {
			$(".block_loader").fadeIn(200);
		},
		success: function(data) {
			showToast("success", data);
			$("#delete-by-type-form")[0].reset();
			$(".note").remove();
			$("#modal-delete-type").hide();
			renderAllAnimal();
		},
		error: handleAjaxError,
		complete: function() {
			$(".block_loader").fadeOut(200);
		},
	});
});

function renderAverageAge() {
	$.ajax({
		url: "http://localhost:8080/api/animals/average_age",
		method: "GET",
		dataType: "json",
		success: function(data) {
			$("#average-animal").empty()
			let html = `<p>Average age of all animal: ${data}</p>`

			$("#average-animal").append(html);
		},
		error: handleAjaxError,

		complete: function() {
			$(".block_loader").fadeOut(200);
		},
	})
}

function validateUpdateForm() {
	const name = $("#name-update").val().trim();
	const species = $("#species-update").val();
	let isValid = true;
	let errors = [];

	if (!name) {
		errors.push("Name is required.");
		isValid = false;
	}

	if (!species) {
		errors.push("Species is required.");
		isValid = false;
	}

	if (species === "ELEPHANT") {
		const weight = parseFloat($("#weight").val());
		if (isNaN(weight) || weight < 0 || weight > 10000) {
			errors.push("Weight must be between 0 and 10000.");
			isValid = false;
		}
	} else if (species === "LION") {
		const speed = parseFloat($("#speed").val());
		if (isNaN(speed) || speed < 0 || speed > 100) {
			errors.push("Speed must be between 0 and 100.");
			isValid = false;
		}
	} else if (species === "PARROT") {
		const canTalk = $("#canTalk").val();
		if (canTalk !== "true" && canTalk !== "false") {
			errors.push("CanTalk must be true or false.");
			isValid = false;
		}
	}

	if (!isValid) {
		showToast("error", errors.join("<br>"));
	}
	return isValid;
}

$("#modal-update-form").submit(function(e) {
	e.preventDefault();

	if (!validateUpdateForm()) {
		return;
	}

	const name = $("#name-update").val().trim();
	const species = $("#species-update").val().toUpperCase();


	let data = { name, species };

	if (species === "ELEPHANT") {
		data.weight = parseFloat($("#weight").val());
	} else if (species === "LION") {
		data.speed = parseFloat($("#speed").val());
	} else if (species === "PARROT") {
		data.canTalk = $("#canTalk").val() === "true";
	}

	$.ajax({
		url: `http://localhost:8080/api/animals`,
		method: "PUT",
		contentType: "application/json",
		data: JSON.stringify(data),
		beforeSend: () => $(".block_loader").fadeIn(200),
		success: function(res) {
			showToast("success", res);
			$("#modal-update-form")[0].reset();
			$("#dynamic-fields-update").empty();
			$("#modal-update").hide();
			renderAllAnimal();

		},
		error: handleAjaxError,
		complete: () => $(".block_loader").fadeOut(200)
	});
});

function renderAnimalStatsChart(startDayStr, endDayStr) {
	$.ajax({
		url: `http://localhost:8080/api/animals/count_by_day?startDay=${startDayStr}&endDay=${endDayStr}`,
		method: "GET",
		dataType: "json",
		success: function(data) {
			const labels = data.map(item => item.date.replace('-', '/'));
			const counts = data.map(item => item.count);

			const ctx = document.getElementById("animalChart").getContext("2d");
			if (window.animalChartInstance) window.animalChartInstance.destroy();

			window.animalChartInstance = new Chart(ctx, {
				type: "bar",
				data: {
					labels: labels,
					datasets: [{
						label: "Animals Added",
						data: counts,
						backgroundColor: "rgba(153, 102, 255, 0.6)",
						borderColor: "rgba(153, 102, 255, 1)",
						borderWidth: 1
					}]
				},
				options: {
					title: {
						display: true,
						text: "Animals Added",
						fontSize: 18
					},
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true,
								stepSize: 1
							}
						}]
					}
				}
			});
		},
		error: handleAjaxError
	});
}

function formatDateLocal(date) {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

$("#date-chart").on("change", function() {
	const selection = $(this).val();
	const today = new Date();

	let startDay, endDay;

	switch (selection) {
		case "this-week": {
			const currentDay = today.getDay();
			const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
			startDay = new Date(today);
			startDay.setDate(today.getDate() + mondayOffset);
			endDay = new Date(startDay);
			endDay.setDate(startDay.getDate() + 6);
			break;
		}
		case "last-week": {
			const currentDay = today.getDay();
			const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
			endDay = new Date(today);
			endDay.setDate(today.getDate() + mondayOffset - 1);
			startDay = new Date(endDay);
			startDay.setDate(endDay.getDate() - 6);
			break;
		}
		case "this-month": {
			startDay = new Date(today.getFullYear(), today.getMonth(), 1);
			endDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			break;
		}
		case "last-month": {
			startDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			endDay = new Date(today.getFullYear(), today.getMonth(), 0);
			break;
		}
		default:
			console.warn("Invalid selection");
			return;
	}

	const startDayStr = formatDateLocal(startDay);
	const endDayStr = formatDateLocal(endDay);

	renderAnimalStatsChart(startDayStr, endDayStr);
});


function renderSpeciesChart() {
	$.ajax({
		url: "http://localhost:8080/api/animals",
		method: "GET",
		dataType: "json",
		success: function(animals) {

			const speciesCounts = {};

			animals.forEach(animal => {
				const species = animal.species;
				speciesCounts[species] = (speciesCounts[species] || 0) + 1;
			});

			const labels = Object.keys(speciesCounts);
			const data = Object.values(speciesCounts);


			const ctx = document.getElementById("speciesChart").getContext("2d");
			new Chart(ctx, {
				type: "pie",
				data: {
					labels: labels,
					datasets: [{
						label: "Number of Animals by Species",
						data: data,
						backgroundColor: [
							"rgba(255, 99, 132, 0.6)",
							"rgba(54, 162, 235, 0.6)",
							"rgba(255, 206, 86, 0.6)"
						],
						borderColor: [
							"rgba(255, 99, 132, 1)",
							"rgba(54, 162, 235, 1)",
							"rgba(255, 206, 86, 1)"
						],
						borderWidth: 1
					}]
				},
				options: {
					title: {
						display: true,
						text: "Animal Count by Species",
						fontSize: 18
					},

					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true,
								stepSize: 1
							}
						}]
					}
				}
			});
		},
		error: handleAjaxError
	});
}

function setupModal(triggerId, modalId) {
	const $trigger = $('#' + triggerId);
	const $modal = $('#' + modalId);
	const $closeBtn = $modal.find('.close');

	$trigger.on('click', function() {
		$modal.show();
	});

	$closeBtn.on('click', function() {
		$modal.hide();
	});

	$(window).on('click', function(e) {
		if ($(e.target).is($modal)) {
			$modal.hide();
		}
	});
}

setupModal('btn-delete-type-modal', 'modal-delete-type');
setupModal('btn-delete-name-modal', 'modal-delete-name');
setupModal('btn-update-modal', 'modal-update');

function getAnimalAndRenderRow(endpoint) {
	$.ajax({
		url: `http://localhost:8080/api/animals/${endpoint}`,
		method: "GET",
		dataType: "json",
		beforeSend: () => $(".block_loader").fadeIn(200),
		success: function(data) {
			$("#animal-error").empty();
			renderAnimalPerPage([data]);
			renderPage(1);
			currentPage = 1;
			maxPage = 1;
			showToast("success", "Loaded animal");
		},
		error: function(xhr) {
			handleNotFound(xhr);
		},
		complete: () => $(".block_loader").fadeOut(200),
	});
}

function getListAnimalAndRenderRow(endpoint) {
	$.ajax({
		url: `http://localhost:8080/api/animals/${endpoint}`,
		method: "GET",
		dataType: "json",
		beforeSend: () => $(".block_loader").fadeIn(200),
		success: function(data) {
			$("#animal-error").empty();
			renderAnimalPerPage(data);
			renderPage(1);
			currentPage = 1;
			maxPage = 1;
			showToast("success", "Loaded animals");
		},
		error: function(xhr) {
			handleNotFound(xhr);
		},
		complete: () => $(".block_loader").fadeOut(200),
	});
}

function getListAnimalHighAttribute(endpoint, message) {
	$.ajax({
		url: `http://localhost:8080/api/animals/${endpoint}`,
		method: "GET",
		dataType: "json",
		beforeSend: () => $(".block_loader").fadeIn(200),
		success: function(data) {
			$("#animal-error").empty();
			const result = [];
			if (data.elephants) result.push(...data.elephants);
			if (data.lions) result.push(...data.lions);
			if (data.parrot) result.push(...data.parrot);
			renderAnimalPerPage(result);
			renderPage(1);
			currentPage = 1;
			maxPage = 1;
			showToast("success", message);
		},
		error: function(xhr) {
			handleNotFound(xhr);
		},
		complete: () => $(".block_loader").fadeOut(200),
	});
}


$(document).ready(function() {
	$(".content-section").hide();
	const firstTarget = $(".sidebar a").first().data("target");
	$(firstTarget).show();
	$(".sidebar a").first().addClass("active");

	renderDataUser();

	$(".sidebar a").click(function(e) {
		e.preventDefault();

		const target = $(this).data("target");
		$(".note").remove();

		if (!target) return;

		if (target === "#home") {
			renderDataUser();
		}

		if (target === "#dash-board") {
			const today = new Date();
			let startDay, endDay;
			const currentDay = today.getDay();
			const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
			startDay = new Date(today);
			startDay.setDate(today.getDate() + mondayOffset);
			endDay = new Date(startDay);
			endDay.setDate(startDay.getDate() + 6);
			const startDayStr = formatDateLocal(startDay);
			const endDayStr = formatDateLocal(endDay);

			renderAnimalStatsChart(startDayStr, endDayStr);
			renderSpeciesChart();
		}

		if (target === "#allanimal") {
			renderAllAnimal();
			renderAverageAge();
		}

		if (target === "#add") {
			checkAdmin(function(isAdmin) {
				if (isAdmin) {
					$("#animalForm")[0].reset();
				} else {
					$("#add").empty();
					$("#add").append("<h1>You are not allowed</h1>");
				}
			});
		}

		$(".content-section").hide();
		$(target).show();

		$(".sidebar a").removeClass("active");
		$(this).addClass("active");
	});

	$("#filter-select").on("change", function() {
		const value = $(this).val();

		if (!value) {
			renderAllAnimal();
			return;
		}

		switch (value) {
			case "function1":
				getAnimalAndRenderRow("oldest");
				break;
			case "function3":
				getAnimalAndRenderRow("heaviest");
				break;
			case "function6":
				let age = prompt("Enter age to find animals above:");
				if (age !== null && !isNaN(age) && age > 0 && age <= 100) {
					getListAnimalAndRenderRow(`above_age?age=${age}`);
				} else {
					showToast("error", "Invalid age");
				}
				break;
			case "function7":
				getAnimalAndRenderRow("first_add");
				break;
			case "function8":
				getAnimalAndRenderRow("fastest");
				break;
			case "function9":
				getListAnimalHighAttribute("high_attribute", "Loaded high attribute animals");
				break;
			case "function10":
				getListAnimalHighAttribute("unique", "Loaded unique animals");
				break;
			default:
				showToast("error", "Unknown filter option");
		}
	});


	$(".sidebar a[href='#']:contains('Function')").click(function(e) {
		e.preventDefault();
		$(".list-function").slideToggle();
	});


	$("#species").on("change", function() {
		const selected = $(this).val();
		const dynamicFields = $("#dynamic-fields");
		dynamicFields.empty();

		const html = getDynamicFieldHTML(selected);
		dynamicFields.empty().append(html);
	});

	$("#species-update").on("change", function() {
		const selected = $(this).val();
		const dynamicFields = $("#dynamic-fields-update");
		dynamicFields.empty();

		const html = getDynamicFieldHTML(selected);
		dynamicFields.empty().append(html);
	});
});

function getDynamicFieldHTML(species) {
	switch (species) {
		case "Elephant":
		case "ELEPHANT":
			return `<label for="weight">Weight</label>
					<input type="number" id="weight" name="weight" placeholder="Weight in kg">`;
		case "Lion":
		case "LION":
			return `<label for="speed">Speed</label>
					<input type="number" id="speed" name="speed" placeholder="Speed in km/h">`;
		case "Parrot":
		case "PARROT":
			return `<label for="canTalk">Can Talk</label>
					<select id="canTalk" name="canTalk">
					  <option value="true">Can Talk</option>
					  <option value="false">Can't Talk</option>
					</select>`;
		default:
			return "";
	}
}

$(".logout").on("click", function() {
	$.ajax({
		url: "http://localhost:8080/logout",
		method: "POST",
		xhrFields: {
			withCredentials: true
		},
		success: function() {
			window.location.href = "/login.html";
		},
		error: function() {
			alert("Logout failed");
		}
	})
})

function renderDataUser() {
	getDataUser(function(data) {
		if (data) {
			$("#home").empty();
			let html = `
				<h1> Welcome </h1>
				<h2> Username: ${data.username} </h2>
				<h2> Role: ${data.roles[0]} </h2>
			`;
			$("#home").append(html);
		}
		else {
			window.location.href = "/login";
		}
	})
}

function checkAdmin(callback) {
	getDataUser(function(data) {
		const isAdmin = data.roles.includes("ROLE_ADMIN");
		callback(isAdmin);
	});
}

function getDataUser(callback) {

	$.ajax({
		url: "http://localhost:8080/api/auth/me",
		method: "GET",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			callback(data);
		},
		error: handleAjaxError,
	});
}

