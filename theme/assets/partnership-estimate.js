const estimate = document.querySelector(".partnership-estimate");
if (estimate) {
  const prices = { design: [200, 450, 950], development: [300, 700, 1500], both: [420, 1050, 2200] };
  const update = () => {
    const service = estimate.elements.namedItem("service").value;
    const scope = Number(estimate.elements.namedItem("scope").value);
    estimate.querySelector("output").textContent = `€${prices[service][scope].toLocaleString("en")}`;
  };
  estimate.addEventListener("change", update);
}
