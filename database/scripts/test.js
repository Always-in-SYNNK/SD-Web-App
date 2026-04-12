import { supabase } from "../scripts/client.js";

async function getAllQualifications() {
  const { data, error } = (await supabase.rpc('get_all_qualifications')).count.limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(data);
  }
}

async function getQualificationsByField(field_input){
  const{ data, error } = await supabase.rpc('get_qualifications_by_field', {field_input : `${field_input}`}).limit(10);

  if(error){
    console.error("Error: ", error);
  }else{
    console.log(data);
  }
}

async function getQualificationsByNQF(level_input){
  const{ data, error } = await supabase.rpc('get_qualifications_by_nqf_level', {level_input : `${level_input}`}).limit(10);

  if(error){
    console.error("Error: ", error);
  }else{
    console.log(data);
  }
}

async function searchQualifications(search_term){
  const{ data, error } = await supabase.rpc('search_qualifications', {search_term : `${search_term}`}).limit(10);

  if(error){
    console.error("Error: ", error);
  }else{
    console.log(data);
  }
}

async function getFields(){
  const{ data, error } = (await supabase.rpc('get_fields'));

  if(error){
    console.error("Error: " + error);
  }else{
    console.log(data);
  }
}

async function getOriginators(){
  const{ data, error } = (await supabase.rpc('get_originators'));

  if(error){
    console.error("Error: " + error);
  }else{
    console.log(data);
  }
}

async function getSubfields(){
  const{ data, error } = (await supabase.rpc('get_subfields'));

  if(error){
    console.error("Error: " + error);
  }else{
    console.log(data);
  }
}

async function getNQFLevels(){
  const{ data, error } = (await supabase.rpc('get_nqf_levels'));

  if(error){
    console.error("Error: " + error);
  }else{
    console.log(data);
  }
}
//testGetAllQualifications();
//testGetQualificationsByField("Field 004");
//testGetQualificationsByNQF(5);
//search_qualifications("library");
//getFields();
//getNQFLevels();
//getSubfields();
getOriginators();