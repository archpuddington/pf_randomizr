$(document).ready(function() {
  var object_storage = ( function(){
    var json;
    $.ajax({
      async:false,
      type: "GET",
      url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/333520/objects.json",
      dataType: "json",
      success : function(data) {
        json = data;
      }
    });
    return { getJSON : function(){
      if (json) return json;
    }};
    })();

  var object_list = object_storage.getJSON();
  var characters = [];
  var click = 0;
  
  var r_len = object_list.races.length;
  var c_len = object_list.classes.length;
  for(var i=0;i<r_len;i++) {
    $('.r_name').append('<option>'+object_list.races[i].race.name+'</option>'); 
  }
  for(var i=0;i<c_len;i++) {
    $('.c_name').append('<option>'+object_list.classes[i].class.name+'</option>');
  }

  $('.go').click(function(){
    var pt_val = $('.pt_val').val();
    var trait_num = $('.trait_num').val();
    var req_c = $('.c_name').val();
    var req_r = $('.r_name').val();
    var lvl = 0;
    var ch_var = false;
    var ch_iter = 0;
    var trig = 0;
    
    while(ch_var==false) {
      ch_var = gen_character(pt_val,trait_num,req_c,req_r,ch_iter);
      ch_iter++;
    }
    console.log(ch_iter);
    
    if(ch_var) { 
      construct_character(ch_var);
      click++;
    }
    
  }); 
  
  
  
  
  //------------------------------------------------------
  //  PRIMARY
  //------------------------------------------------------
  function gen_character(pt_val,trait_num,req_c,req_r,ch_iter) {
    var character = {};
    var trait_sel = gen_trait_index(trait_num);
    var trait_name = gen_trait_name(trait_sel);
    var as = ["str","dex","con","int","wis","cha"];
    var valid = 0;  
    var base = [];
    var race = [];
    var alignment;
    var alignment_num;
    var school;
    var class_name;
    
    //process
    if((req_r!='any race')&&req_c=='any class') {
      race.push(req_r);
      base = gen_base(race,1,'race');
      base = normalize(base,trait_sel,pt_val,race);
      if(base) {} else { return false; }
      class_name = gen_class(base);
      if(class_name!=req_c&&req_c!='any class') { return false; }
      alignment_num = gen_alignment(trait_name,race);
      alignment = align_conv_num(alignment_num);
      school = gen_school(trait_name,alignment,base,class_name);
      console.log('completed race only');
    } else if((req_r=='any race')&&(req_c!='any class')) {
      class_name = req_c;
      var class_name_arr = [class_name];
      base = gen_base(class_name_arr,1,'class');
      race = gen_race(base);
      if(race != req_r&&req_r != 'any race') { return false; }      
      base = normalize(base,trait_sel,pt_val,race);
      if(base) {} else { return false; }
      alignment_num = gen_alignment(trait_name,race);
      alignment = align_conv_num(alignment_num);
      school = gen_school(trait_name,alignment,base,class_name);   
      console.log('completed class only');   
    } else if((req_r!='any race')&&(req_c!='any class')) {
      race.push(req_r);
      class_name = req_c;
      var class_name_arr = [class_name];
      base = gen_base(class_name_arr,1,'class');
      base = normalize(base,trait_sel,pt_val,race);
      if(base) {} else { return false; }
      alignment_num = gen_alignment(trait_name,race);
      alignment = align_conv_num(alignment_num);
      school = gen_school(trait_name,alignment,base,class_name);   
      console.log('completed class and race');         
    }
    else {
      base = gen_base(trait_name,trait_num,'trait');
      race = gen_race(base);
      if(race != req_r&&req_r != 'any race') { return false; }
      base = normalize(base,trait_sel,pt_val,race);
      if(base) {} else { return false; }
	  class_name = gen_class(base);
      if(class_name != req_c&&req_c != 'any class') { return false; }
	  alignment_num = gen_alignment(trait_name,race);
	  alignment = align_conv_num(alignment_num);
	  school = gen_school(trait_name,alignment,base,class_name);
	  console.log('completed neither class nor race');
	}
	
	if(base&&race&&class_name&&alignment) { valid=1; }
	
	if(valid) {
      character.id = click;
      character.race = race;
      character.traits = trait_name; 
      character.ability_scores = base;
      character.class_name = class_name;
	  character.alignment = alignment;
	  if(school != 1) { character.school = school; }
        characters.push(character);
      return character;
    } else {
      return false;
    }
  } 
  
  //------------------------------------------------------
  //  RNG / MATH
  //------------------------------------------------------
  function rng_mod(type,arr_length,trait_mod,max_trait) {
    if(type == "trait_gen") {
      return rng(arr_length,1,"dstep");
    }
    else if(type == "zero_min") {
      return rng(arr_length,0,"dstep");
    }
    else if(type == "stat_gen") {
      if(trait_mod == "1") {
        return rng((0.8/max_trait),(1.0/max_trait),"minmax");
      } else if(trait_mod == "2") {
        return rng((1.0/max_trait),(1.4/max_trait),"minmax");
      } else if(trait_mod == "3") {
        return rng((1.7/max_trait),(1.9/max_trait),"minmax");
      }
    }
  }

  function rng(min,max,type) {
    if(type=="minmax"){return (Math.random()*(max-min)+min);}
    //min=step,max=base
    else if(type=="dstep"){
      return (Math.floor(Math.random()*min)+max);
    }
  }
  
  function sort_number(a,b) {
    return a - b;
  }

  //------------------------------------------------------
  //  GENERATION
  //------------------------------------------------------
  
  function gen_trait_index(max) {
    //gen rng nums
    var i = 0;
    var trait_sel = [];
    var tl_len = object_list.traits.length;
    while(i<max) {
      var r = rng_mod("trait_gen",tl_len-1);
      if(trait_sel.indexOf(r) == -1) {
        trait_sel.push(r);
        i++;
      }
    }
    return trait_sel;
  }

  function gen_trait_name(trait_sel) { 
    //replace w text vals
    var ts_len = trait_sel.length;
    var trait_name = [];
    for(var i=0;i<ts_len;i++) {
      trait_name.push(trait_sel[i]);
    } 
    for(var i=0;i<ts_len;i++) {
      trait_name[i] = object_list.traits[trait_sel[i]].trait.name;    
    }
    //list of text vals
    return trait_name;
  }

  function gen_base(arr,max,type) {
    var arr_len = arr.length;
    var ol_len;
    if(type=='trait') { ol_len = object_list.traits.length; }
    else if(type=='race') { ol_len = object_list.races.length; }
    else if(type=='class') { ol_len = object_list.classes.length; }
    var base = [];
    var mod = [0,0,0,0,0,0];
    for(var i=0;i<arr_len;i++) {
      for(var j=0;j<ol_len;j++) {
        if((type=='trait')&&(arr[i] == object_list.traits[j].trait.name)) {
          for(var k=0;k<6;k++) {
            var letter = object_list.traits[j].trait.ability_scores[k].value;
            mod[k] += rng_mod("stat_gen",1,letter,max);
          }
        }
        else if((type=='race')&&(arr[i] == object_list.races[j].race.name)) {
          for(var k=0;k<6;k++) {
            var letter = object_list.races[j].race.ability_scores[k].value;
            mod[k] += rng_mod("stat_gen",1,letter,max);
          }          
        }
        else if((type=='class')&&(arr[i] == object_list.classes[j].class.name)) {
          for(var k=0;k<6;k++) {
            var letter = object_list.classes[j].class.ability_scores[k].value;
            mod[k] += rng_mod("stat_gen",1,letter,max);
          }          
        }

      }
    }
    for(var i=0;i<6;i++) {
      base.push(Math.floor(10*mod[i]));
    }
    return base;
  }
  
  function gen_race(base) {
    var arr_len = 0;
    var brk = [];
    var r_len = object_list.races.length;
  
    for(var i=0;i<r_len;i++) {
      var r_tot = 0;
      var mod = [0,0,0,0,0,0];
      for(var j=0;j<6;j++) {
        var score_adj = 2;
        var r_val = object_list.races[i].race.ability_scores[j].value;
        var name = object_list.races[i].race.name;
        var dual = rng_mod("trait_gen",2);
      
        if(name.indexOf('half-elf') != -1) {
          if(dual==1) {
            if(j==1) { r_val=3; }
          } else {
            if(j==4) { r_val=3; }
          }
        }
      
        if(r_val == 1) {score_adj = 1;}
        else if(r_val == 3) {score_adj = 10;}
      
        if((object_list.races[i].race.name.indexOf('human') !== -1)) {score_adj = 3;}
      
        var adj_base = Math.pow(base[j], 3);
        mod[j] = Math.floor(adj_base*score_adj);
        r_tot += mod[j];
      }
      brk.push(r_tot);    
      arr_len += r_tot;
    }

    //gen
    var sel = rng_mod("trait_gen",arr_len);
    var index = 0;
    var brk_len = brk.length;
    var curr = 0;
    for(var i=0;i<brk_len;i++) {
      if(sel > curr) {
        curr += brk[i];
      } else {
        index = i;     
        break;
      }
    }
    return object_list.races[index].race.name;
  }
  
  function gen_class(base) {
	var arr_len = 0;
	var brk = [];
	var c_len = object_list.classes.length;
	for(var i=0;i<c_len;i++) {
		var c_tot = 0;
		var mod = [0,0,0,0,0,0];
		for(var j=0;j<6;j++) {
		  var score_adj = 0.05;
          var c_val = object_list.classes[i].class.ability_scores[j].value;
          var name = object_list.classes[i].class.name;
		  if(c_val == 1) { score_adj = 0.01; }
		  else if(c_val == 3) { score_adj = 10; }
		  var adj_c = Math.pow(base[j], 3);
		  //var adj_c = 1;
      mod[j] = Math.floor(adj_c*score_adj);
		  c_tot += mod[j];
		}
		brk.push(c_tot);
		arr_len += c_tot;
	}
	
	var sel = rng_mod("trait_gen",arr_len);
	var index = 0;
	var brk_len = brk.length;
	var curr = 0;
	for(var i=0;i<brk_len;i++) {
		if(sel > curr) { 
      curr += brk[i]; 
    }
		else { 
		  index = i;
		  break;
     	}
	}
    
    var out = object_list.classes[index].class.name;
    for(var i=0;i<6;i++) {
      if((base[i]<13)&&(object_list.classes[index].class.ability_scores[i].value==3)) {
        out = false;
      }
    }
	  return out;
  }
  
  
  function gen_alignment(trait_name,race) {
    var arr_len = 0;
    var brk = [];
    var tm_len = object_list.traits.length;
    var t_len = trait_name.length;
    var r_len = object_list.races.length;
    var mod = [0,0];
    var score_adj;
    for(var i=0;i<t_len;i++) {
      score_adj = 2;
      for(var j=0;j<tm_len;j++) {
        var tm_name = object_list.traits[j].trait.name;
        if(trait_name[i]==tm_name) {
          for(var k=0;k<2;k++) {
            var tma_val = object_list.traits[j].trait.alignment[k].value;
            if(tma_val==3) { score_adj=10; }
            else if(tma_val==1) { score_adj=1; }
            mod[k] += score_adj;
          }
        }        
      }
    }
    for(var i=0;i<r_len;i++) {
      score_adj = 2;
      if(race==object_list.races[i].name) {
        for(var j=0;j<2;j++) {
          var rma_val = object_list.races[i].race.alignment[j].value;
          if(rma_val==3) { score_adj=10; }
          else if(rma_val==1) { score_adj=1; }
          mod[j] +=score_adj
        }
      }
    }
    for(var i=0;i<2;i++) {
      mod[i] = Math.round(mod[i]/(t_len+1));
    }
    return mod;
  }
  
  function align_conv_num(alignment_num) {
    var align_l = "N";
    var align_g = "N";
    if(alignment_num[0]==1) { align_l="L"; }
    else if(alignment_num[0]==3) { align_l="C"; }
    if(alignment_num[1]==1) { align_g="G"; }
    else if(alignment_num[1]==3) { align_g="E"; }
    var out = align_l+align_g;
    if(out=="NN") { out="N"; }
    return out;
  }
  
  function gen_school(trait_name,alignment,base,class_name) {
    if(class_name=="cleric") {
      var d_len = object_list.domains.length;
      var class_i = false;
      var brk = [];
      var arr_len = 0;
      for(var i=0;i<object_list.classes.length;i++) {
        if(class_name==object_list.classes[i].class.name) { class_i = i; }
      }
      for(var i=0;i<d_len;i++) {
        mod = 0;
        for(var j=0;j<6;j++) {
          var d_val = parseInt(object_list.domains[i].domain.ability_scores[j].value);
          var score_adj = 0.05;
          if(d_val==3) { score_adj = 10; }
          else if(d_val==1) { score_adj = 0.01; }
          mod += (Math.pow(parseInt(object_list.classes[class_i].class.ability_scores[j].value),3)*score_adj);
        }
        for(var j=0;j<5;j++) {
          var dro_val = parseInt(object_list.domains[i].domain.roles[j].value);
          var score_adj = 0.05;
          if(dro_val==3) { score_adj=10; }
          else if(dro_val==1) {score_adj=0.01; }
          mod += (Math.pow(parseInt(object_list.classes[class_i].class.roles[j].value),3)*score_adj);
        }
        for(var j=0;j<2;j++) {
          var dra_val = parseInt(object_list.domains[i].domain.range[j].value);
          var score_adj = 0.05;
          if(dra_val==3) { score_adj=10; }
          else if(dra_val==1) {score_adj=0.01; }
          mod += (Math.pow(parseInt(object_list.classes[class_i].class.range[j].value),3)*score_adj);
        }
        brk.push(mod);
        arr_len += mod;
      }
    
    var sel = [];
    var out = [0,0];
    var index = 0;

    for(var i=0;i<2;i++) {
      var r = rng_mod("trait_gen",arr_len);
      sel.push(r);
      var curr = 0;
        for(var j=0;j<brk.length;j++) {
          if(r > curr) { curr += brk[j]; }
          else {
            index = j;
            break;
          }
        }
      out[i]=object_list.domains[index].domain.name;
    }
    
    
    //figure out alignment restrictions
    if(out[0]==out[1]) {
      return false;
    } else {
      return out;
    }
    }
    else if(class_name=="wizard") {
      var s_len = object_list.schools.length;
      var class_i = false;
      var brk = [];
      var arr_len = 0;
      for(var i=0;i<object_list.classes.length;i++) {
        if(class_name==object_list.classes[i].class.name) { class_i = i; }
      }
      for(var i=0;i<s_len;i++) {
        mod = 0;
        for(var j=0;j<6;j++) {
          var s_val = parseInt(object_list.schools[i].school.ability_scores[j].value);
          var score_adj = 0.05;
          if(s_val==3) { score_adj = 10; }
          else if(s_val==1) { score_adj = 0.01; }
          mod += (Math.pow(parseInt(object_list.classes[class_i].class.ability_scores[j].value),3)*score_adj);
        }
        for(var j=0;j<5;j++) {
          var sro_val = parseInt(object_list.schools[i].school.roles[j].value);
          var score_adj = 0.05;
          if(sro_val==3) { score_adj=10; }
          else if(sro_val==1) {score_adj=0.01; }
          mod += (Math.pow(parseInt(object_list.classes[class_i].class.roles[j].value),3)*score_adj);
        }
        for(var j=0;j<2;j++) {
          var sra_val = parseInt(object_list.schools[i].school.range[j].value);
          var score_adj = 0.05;
          if(sra_val==3) { score_adj=10; }
          else if(sra_val==1) {score_adj=0.01; }
          mod += (Math.pow(parseInt(object_list.classes[class_i].class.range[j].value),3)*score_adj);
        }
        brk.push(mod);
        arr_len += mod;
      }
    var out = [0];
    var index = 0;
    var r = rng_mod("trait_gen",arr_len);
    var curr = 0;
      for(var j=0;j<brk.length;j++) {
        if(r > curr) { curr += brk[j]; }
        else {
          index = j;
          break;
        }
      }
    out[0]=object_list.schools[index].school.name;
    return out;
    }
    return 1;
  }
	  

  //------------------------------------------------------
  //  PT MOD / VALS
  //------------------------------------------------------

  function gen_pt_mod(num) {
    var mod = -2;
    if(num==9) {mod=-1;}
    else if(num==10) {mod=0;}
    else if(num==11) {mod=1;}
    else if(num==12) {mod=2;}
    else if(num==13) {mod=3;}
    else if(num==14) {mod=5;}
    else if(num==15) {mod=7;}
    else if(num==16) {mod=10;}
    else if(num==17) {mod=13;}
    else if(num==18) {mod=17;}
    return mod;
  }
  
  function gen_pt_val(base_f,pt_val) {
    var pt_tot = 0;
    for(i=0;i<6;i++) { pt_tot += gen_pt_mod(base_f[i]); }
    var out = (pt_val-pt_tot);
    return out;
  }
  
  //------------------------------------------------------
  //  NORMALIZE
  //------------------------------------------------------  
  
  function normalize(base, trait_sel, pt_val, race) {
    var diff = 1;
    var iter = 0;
    var base_f = [];
    for (var i = 0; i < 6; i++) {
        base_f.push(base[i]);
    }
    diff = gen_pt_val(base_f, pt_val);
    var ts_len = trait_sel.length;
    var r_len = object_list.races.length;
    var race_i;
    var race_vals = [];
    var avg = [0, 0, 0, 0, 0, 0];
    //generate prescribed averages
    for (var i = 0; i < r_len; i++) {
        if (object_list.races[i].race.name.indexOf(race) != -1) {
            race_i = i;
        }
    }
    for (var i = 0; i < ts_len; i++) {
        for (var j = 0; j < 6; j++) {
            avg[j] += parseInt(object_list.traits[trait_sel[i]].trait.ability_scores[
                j].value);
        }
    }
    for (var i = 0; i < 6; i++) {
        avg[i] += parseInt(object_list.races[race_i].race.ability_scores[i]
            .value);
        avg[i] = Math.ceil(avg[i] / (ts_len + 1));
        race_vals.push(object_list.races[race_i].race.ability_scores[i].value);
    }
    while (diff != 0) {
        if (iter >= 30) {
            base = false;
            return base;
        }
        iter++;
        //major boost
        //trait/race avg=3->+=3
        if (diff > 10) {
            var avg3 = [];
            for (var i = 0; i < 6; i++) {
                if ((avg[i] == 3) && (base_f[i] <= 14)) {
                    avg3.push(i);
                }
            }
            var rng;
            if (avg3.length > 1) {
                rng = rng_mod("zero_min", avg3.length, 1);
                base_f[avg3[rng]] += 2;
            } else if (avg3.length == 1) {
                base_f[avg3[0]] += 2;
            } else {
                var max = 0;
                var max_arr = [];
                for (var i = 0; i < 6; i++) {
                    if (max < base_f[i]) {
                        max = base_f[i];
                    }
                }
                max_arr.push(base_f.indexOf(max));
                rng = rng_mod("zero_min", max_arr.length, 1);
                base_f[max_arr[rng]] += 2;
            }
            diff = gen_pt_val(base_f, pt_val);
        }
        //minor boost
        //racial=3->16
        else if ((diff <= 10) && (diff > 5)) {
            var race3 = [];
            for (var i = 0; i < 6; i++) {
                if ((object_list.races[race_i].race.ability_scores[i].value ==
                    3) && (base_f[i] <= 14)) {
                    race3.push(i);
                }
            }
            var rng;
            if (race3.length > 1) {
                rng = rng_mod("zero_min", race3.length, 1);
                base_f[race3[rng]] += 2;
            } else if (race3.length == 1) {
                base_f[race3[0]] += 2;
            } else {
                var max = 0;
                var max_arr = [];
                for (var i = 0; i < 6; i++) {
                    if (max < base_f[i]) {
                        max = base_f[i];
                    }
                }
                max_arr.push(base_f.indexOf(max));
                rng = rng_mod("zero_min", max_arr.length, 1);
                base_f[max_arr[rng]] += 2;
            }
            diff = gen_pt_val(base_f, pt_val);
        }
        //tap up
        //random 12-13->13-14
        else if ((diff <= 5) && (diff > 0)) {
            var up = [];
            for (var i = 0; i < 6; i++) {
                if ((base_f[i] == 9) || (base_f[i] == 11) || (base_f[i] ==
                    12) || (base_f[i] == 13)) {
                    up.push(i);
                }
            }
            var rng = 0;
            if (up.length > 1) {
                rng = rng_mod("zero_min", up.length, 1);
                base_f[up[rng]] += 1;
            } else if (up.length == 1) {
                base_f[up[0]] += 1;
            } else {
                rng = rng_mod("zero_min", 6, 1);
                base_f[rng] += 1;
            }
            diff = gen_pt_val(base_f, pt_val);
        }
        //tap down
        else if ((diff >= -5) && (diff < 0)) {
            var even = [];
            var odd = [];
            for (var i = 0; i < 6; i++) {
                if ((base_f[i] % 2)&&(base_f[i]>9)) {
                    odd.push(i);
                } else if((base_f[i]%2==false)&&(base_f[i]>9)) {
                    even.push(i);
                }
            }
            var rng = 0;
            if (odd.length > 1) {
                while (odd[rng] == 2) {
                    rng = rng_mod("zero_min", odd.length, 1);
                }
                base_f[odd[rng]] -= 1;
            } else if (even.length > 1) {
                while (even[rng] == 2) {
                    rng = rng_mod("zero_min", even.length, 1);
                }
                base_f[even[rng]] -= 1;
            } else if (even.length == 1) {
                base_f[even[0]] -= 1;
            } else {
                rng = rng_mod("zero_min", 6, 1);
                base_f[rng] -= 1;
            }
            diff = gen_pt_val(base_f, pt_val);
        }
        //minor reduc
        else if ((diff >= -10) && (diff < -5)) {
            var arr_14 = [];
            for (var i = 0; i < 6; i++) {
                if (base_f[i] > 13) {
                    arr_14.push(i);
                }
                var rng = 0;
                if (arr_14.length > 1) {
                    rng = rng_mod("zero_min", arr_14, 1);
                    base_f[arr_14[rng]] -= 1;
                } else if (arr_14.length == 1) {
                    base_f[arr_14[0]] -= 1;
                } else {
                    rng = rng_mod("zero_min", 6, 1);
                    base_f[rng] -= 1;
                }
                diff = gen_pt_val(base_f, pt_val);
            }
        }
        //major reduc
        else if (diff < -10) {
            var arr_15 = [];
            for (var i = 0; i < 6; i++) {
                if (base_f[i] > 14) {
                    arr_15.push(i);
                }
            }
            var rng = 0;
            if (arr_15.length > 1) {
                rng = rng_mod("zero_min", arr_15.length, 1);
                base_f[arr_15[rng]] -= 3;
            } else if (arr_15.length == 1) {
                base_f[arr_15[0]] -= 3;
            } else {
                while (arr_15[rng] == 2) {
                    rng = rng_mod("zero_min", 6, 1);
                }
                base_f[rng] -= 3;
            }
            diff = gen_pt_val(base_f, pt_val);
        }
    }
    
    //add racial mod
    for(var i=0;i<6;i++){
      var mod = 0;
      var val = object_list.races[race_i].race.ability_scores[i].value;
      if(val == 1) { mod=-2; }
      else if(val == 3) { mod=2; }
      var out = base_f[i] + mod;
      if(out>18||out<8) {
        base_f = false;
        return base_f;
      } else {
        base_f[i] += mod; 
      }
    }
    return base_f;
}
  
  //------------------------------------------------------
  //  CONSTRUCTION
  //------------------------------------------------------   
  
  function construct_character(character) {
    var index = characters.indexOf(character);
    var score_type = ["str","dex","con","int","wis","cha"];
    var html = '<li class="arc"><h3>'+characters[index].alignment+' '+characters[index].race+' '+characters[index].class_name+'</h3></li><li class="stats_wrap"><table class="stats_table"></table></li><li class="trait_wrap"><ul class="traits"></ul></li>';
    $('.count a').html(characters[index].id);
    $('ul.wrap').html(html);
    for(var i=0;i<characters[index].ability_scores.length;i++) {
      var score = characters[index].ability_scores[i];
      $('.stats_table').append('<tr class="score"><td class="type">'+score_type[i]+'</td><td class="value">'+score+'</td></tr>');
    }
    for(var i=0;i<characters[index].traits.length;i++) {
      var trait = characters[index].traits[i];
      $('.traits').append('<li class="trait">'+trait+'</li>');
    }
    if(characters[index].school) {
      $('ul.wrap').append('<li class="schools"></li>');
     for(var i=0;i<characters[index].school.length;i++) {
		var school = characters[index].school[i];
		$('.schools').append('<li class="school">'+school+'</li>');
	} 
    }
	
  }
  
  
});