import "dotenv/config";
import express from "express";
import { get_location } from "./rotas/getLocation";
import { get_location_id } from "./rotas/getLocation";
import { get_insurances } from "./rotas/getInsurances";
import { get_resources } from "./rotas/getResources";
import { get_activities } from "./rotas/getActivities";
const app = express();

app.use(express.json({ limit: '50mb' }))

app.get("/locations",async (req, res) => {
    const json = await get_location();
    return res.json(json);
  });

  app.get("/locations/:location_lid",async (req, res) => {
    const json = await get_location_id(req.params.location_lid);
    return res.json(json);
  });

app.get("/insurances",async (req, res) => {
    const json = await get_insurances();
    return res.json(json);
});

app.get("/resources",async (req, res) => {
  const json = await get_resources();
  return res.json(json);
});

app.get("/activities",async (req, res) => {
  const json = await get_activities();
  return res.json(json);
});


app.listen(8283, (err, data) => {
  console.log("Ouvindo na porta 8283");
});

export default app;
