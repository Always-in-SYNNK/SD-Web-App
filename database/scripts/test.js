import { supabase } from "../scripts/client.js";

async function testGetAllQualifications() {
  const { data, error } = (await supabase.rpc('get_all_qualifications')).count.limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(data);
  }
}

async function testGetQualificationsByField(field_input){
  const{ data, error } = await supabase.rpc('get_qualifications_by_field', {field_input : `${field_input}`}).limit(10);

  if(error){
    console.error("Error: ", error);
  }else{
    console.log(data);
  }
}

async function testGetQualificationsByNQF(level_input){
  const{ data, error } = await supabase.rpc('get_qualifications_by_nqf_level', {level_input : `${level_input}`}).limit(10);

  if(error){
    console.error("Error: ", error);
  }else{
    console.log(data);
  }
}

async function search_qualifications(search_term){
  const{ data, error } = await supabase.rpc('search_qualifications', {search_term : `${search_term}`}).limit(10);

  if(error){
    console.error("Error: ", error);
  }else{
    console.log(data);
  }
}
//testGetAllQualifications();
//testGetQualificationsByField("Field 004");
//testGetQualificationsByNQF(5);
//search_qualifications("library");