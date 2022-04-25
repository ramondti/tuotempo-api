import "dotenv/config";
import express from "express";
import { get_location } from "./rotas/getLocation";
import { get_location_id } from "./rotas/getLocation";
import { get_insurances } from "./rotas/getInsurances";
import { get_resources } from "./rotas/getResources";
import { get_resources_location_lid } from "./rotas/getResources";
import { get_resources_insurance_lid } from "./rotas/getResources";
import { get_activities } from "./rotas/getActivities";
import { get_activities_resource_lid } from "./rotas/getActivities";
import { get_activities_resource_lid_location_lid } from "./rotas/getActivities";
import { get_activities_insurance_lid } from "./rotas/getActivities";
import { get_availabilities } from "./rotas/Availabilities/Availabilities";
import { get_availabilities_first } from "./rotas/Availabilities/Availabilities";
import { post_appointments } from "./rotas/Appointments/PostAppointments";
import { del_appointments } from "./rotas/Appointments/DellAppointments";
import {put_appointments} from "./rotas/Appointments/PutAppointments";
import {get_app_lid} from "./rotas/Booking_History/getApp_lid";
import {get_resource} from "./rotas/Booking_History/getResource"
import {get_user_lid} from "./rotas/Booking_History/getUser_lid";
import {get_noshow} from "./rotas/Booking_History/getNoshow"
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

app.get("/locations/:location_lid/resources",async (req, res) => {
  const json = await get_resources_location_lid(req.params.location_lid);
  return res.json(json);
});

app.get("/insurances/:insurance_lid/resources",async (req, res) => {
  const json = await get_resources_insurance_lid(req.params.insurance_lid);
  return res.json(json);
});

app.get("/activities",async (req, res) => {
  const json = await get_activities();
  return res.json(json);
});

app.get("/resources/:resource_lid/activities",async (req, res) => {
  const json = await get_activities_resource_lid(req.params.resource_lid);
  return res.json(json);
});

app.get("/locations/:location_lid/resources/:resource_lid/activities",async (req, res) => {
  const json = await get_activities_resource_lid_location_lid(req.params.location_lid,req.params.resource_lid);
  return res.json(json);
});


app.get("/insurances/:insurance_lid/activities",async (req, res) => {
  const json = await get_activities_insurance_lid(req.params.insurance_lid);
  return res.json(json);
});


app.get("/availabilities/:activity_lid",async (req, res) => {
  const {start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids,results_number} = req.query;
  const json = await get_availabilities(req.params.activity_lid,start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids,results_number);
  return res.json(json);
});

app.get("/availabilities/:activity_lid/first",async (req, res) => {
  const {start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids} = req.query;
  const json = await get_availabilities_first(req.params.activity_lid,start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids);
  return res.json(json);
});


app.post("/appointments",async (req, res) => {
  const {availability,user,notes,tags,referral_doctor,communication} = req.body;
  const json = await post_appointments(availability,user,notes,tags,referral_doctor,communication);
  //console.log(user)
  return res.json(json);
});


app.delete("/appointments/:app_lid",async (req, res) => {
  const json = await del_appointments(req.params.app_lid);
  return res.json(json);
});


app.put("/appointments/:app_lid", async (req, res) => {
  const {status} = req.body
  const json = await put_appointments(req.params.app_lid,status);
  return res.json(json)
});


app.get("/appointments/resources/:resource_lid",async (req, res) => {
 const json = await get_resource(req.params.resource_lid,req.params.start_date,req.params.end_date);
 return res.json(json);
});


app.get("/appointments/:app_lid",async (req, res) => {
  const json = await get_app_lid(req.params.app_lid);
  console.log('Entrou aq')
  return res.json(json);
});


app.get("/appointments/users/:user_lid",async (req, res) => {
  const {start_date,end_date} = req.query;
  const json = await get_user_lid(req.params.user_lid,start_date,end_date);
  return res.json(json);
});

app.get("/appointments/noshow",async (req, res) => {
  const {start_date,end_date} = req.query;
  const json = await get_noshow(start_date,end_date);
  return res.json(json);
});



app.listen(8283, (err, data) => {
  console.log("Ouvindo na porta 8283");
});

export default app;
