import{l as h,f as w,c as I,s as i,a as d,b as c}from"./shared-C8pliTzj.js";const T=document.getElementById("app");T.innerHTML=`
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${h()}
    <nav>
      <a href="./index.html">← BACK TO VOTING</a>
      <span class="admin-pill">ORGANIZER CONTROL ROOM</span>
    </nav>
  </div>
</header>

<main class="wrap admin-main">
  <div class="tiny-label">
    OFFICIAL NADANU 3.0 / BACKSTAGE
  </div>

  <h1 class="admin-title">CONTROL <em>ROOM.</em></h1>
  <div id="notice" class="notice" hidden></div>

  <section id="login" class="admin-panel narrow">
    <h2>AUTHORIZED ACCESS</h2>
    <p>Sign in using the organizer account created in Supabase Authentication.</p>

    <form id="login-form">
      <label>
        EMAIL
        <input type="email" id="email"
          autocomplete="username" required
          placeholder="organizer@example.com"/>
      </label>

      <label>
        PASSWORD
        <input type="password" id="password"
          autocomplete="current-password"
          required minlength="6"/>
      </label>

      <button class="btn btn-orange" type="submit">
        SIGN IN ↗
      </button>
    </form>
  </section>

  <section id="dashboard" hidden>
    <div class="dash-top">
      <div>
        <h2>THE LINEUP</h2>
        <p>Manage finalists, event status, and voting window.</p>
      </div>

      <button class="btn btn-outline" id="logout">
        SIGN OUT ↗
      </button>
    </div>

    <div class="admin-columns">
      <div class="admin-panel">
        <div class="tiny-label">VOTING CONTROL</div>

        <form id="event-form">
          <label>
            EVENT STATUS
            <select id="event-status">
              <option value="draft">DRAFT — NOT OPEN</option>
              <option value="open">OPEN FOR VOTING</option>
              <option value="closed">CLOSED</option>
            </select>
          </label>

          <label>
            START DATE & TIME (OPTIONAL)
            <input id="starts-at" type="datetime-local"/>
          </label>

          <label>
            END DATE & TIME (OPTIONAL)
            <input id="ends-at" type="datetime-local"/>
          </label>

          <button class="btn btn-orange" type="submit"
            id="save-status">
            SAVE VOTING STATUS
          </button>
        </form>
      </div>

      <div class="admin-panel">
        <div class="tiny-label">ADD A FINALIST</div>

        <form id="contestant-form">
          <label>
            CATEGORY
            <select id="category" required></select>
          </label>

          <label>
            PERFORMER / TEAM NAME
            <input id="name" required maxlength="120"
              placeholder="e.g. The Fire Crew"/>
          </label>

          <label>
            STAGE NAME / SUBTITLE
            <input id="stage-name" maxlength="140"
              placeholder="e.g. Grand Finale Act"/>
          </label>

          <label>
            PERFORMANCE TITLE
            <input id="performance-title" maxlength="160"
              placeholder="e.g. Showstopper"/>
          </label>

          <label>
            PHOTO URL (OPTIONAL)
            <input id="image-url" type="url"
              placeholder="https://..."/>
          </label>

          <label>
            DISPLAY ORDER
            <input id="sort-order" type="number"
              min="0" value="1" required/>
          </label>

          <button class="btn btn-orange" type="submit">
            ADD FINALIST ↗
          </button>
        </form>
      </div>
    </div>

    <div class="admin-panel">
      <div class="tiny-label">ACTIVE FINALISTS</div>
      <div id="finalists" class="finalist-list"></div>
    </div>

    <div class="admin-panel" id="edit-panel" hidden>
      <div class="tiny-label">EDIT FINALIST</div>
      <form id="edit-form">
        <input id="edit-id" type="hidden"/>
        <label>CATEGORY<select id="edit-category" required></select></label>
        <label>PERFORMER / TEAM NAME<input id="edit-name" maxlength="120" required/></label>
        <label>STAGE NAME / SUBTITLE<input id="edit-stage-name" maxlength="140"/></label>
        <label>PERFORMANCE TITLE<input id="edit-performance-title" maxlength="160"/></label>
        <label>PHOTO URL<input id="edit-image-url" type="url"/></label>
        <label>DISPLAY ORDER<input id="edit-sort-order" type="number" min="0" required/></label>
        <button class="btn btn-orange" type="submit">SAVE CHANGES</button>
        <button class="btn btn-outline" id="cancel-edit" type="button">CANCEL</button>
      </form>
    </div>
    <div class="admin-panel">
      <div class="tiny-label">VOTE RESULTS</div>
      <p>
        Vote counts are restricted to authorized administrators
        and are not shown on the public voting page.
      </p>
      <div id="results" class="results-list"></div>

      <button class="btn btn-outline" id="refresh">
        REFRESH RESULTS ↻
      </button>
    </div>
    <div class="admin-panel">
      <div class="tiny-label">VOTER DEVICE RECORDS</div>
      <p>These device references are anonymous hashes, not phone names. Select a vote using its finalist, timestamp and reference. Resetting ONE vote requires admin credentials and is audited.</p>
      <button class="btn btn-outline" id="load-votes" type="button">LOAD VOTER RECORDS ↻</button>
      <div id="voter-records" class="finalist-list"></div>
      <form id="reset-form" hidden>
        <input id="reset-vote-id" type="hidden"/>
        <p id="reset-selection"></p>
        <label>ADMIN EMAIL<input id="reset-email" type="email" required autocomplete="username"/></label>
        <label>ADMIN PASSWORD<input id="reset-password" type="password" required autocomplete="current-password"/></label>
        <button class="btn btn-orange" id="confirm-reset" type="submit">VERIFY ADMIN & RESET SELECTED VOTE</button>
        <button class="btn btn-outline" id="cancel-reset" type="button">CANCEL</button>
      </form>
    </div>
  </section>
</main>

${w()}
`;let y=[],b=[];function v(o){document.getElementById("login").hidden=o,document.getElementById("dashboard").hidden=!o}function n(o){return document.getElementById(o).value.trim()}function E(o){if(!o)return"";const a=new Date(o),t=e=>String(e).padStart(2,"0");return`${a.getFullYear()}-${t(a.getMonth()+1)}-${t(a.getDate())}T${t(a.getHours())}:${t(a.getMinutes())}`}async function m(){const{data:o,error:a}=await d.auth.getUser();if(a||!o?.user||o.user.is_anonymous)return!1;const{data:t,error:e}=await d.from("admin_roles").select("role").eq("user_id",o.user.id).maybeSingle();if(e)throw e;return!!t}async function g(){const[{data:o,error:a},{data:t,error:e},{data:s,error:l}]=await Promise.all([d.from("categories").select("id,slug,name").order("name"),d.from("contestants").select("id,name,stage_name,performance_title,image_url,sort_order,active,category_id").order("sort_order"),d.from("voting_events").select("id,status,starts_at,ends_at").eq("id",1).maybeSingle()]);if(a||e||l)throw a||e||l;if(!s)throw new Error("Voting event not found. Check voting_events table.");y=t||[],document.getElementById("edit-category").innerHTML=(o||[]).map(r=>`<option value="${c(r.id)}">${c(r.name)}</option>`).join("");const u=new Map((o||[]).map(r=>[r.id,r.name]));document.getElementById("category").innerHTML=(o||[]).map(r=>`<option value="${c(r.id)}">${c(r.name)}</option>`).join(""),document.getElementById("event-status").value=s.status,document.getElementById("starts-at").value=E(s.starts_at),document.getElementById("ends-at").value=E(s.ends_at),document.getElementById("finalists").innerHTML=t?.length?t.map(r=>`
        <div class="finalist-row">
          <div>
            <strong>${c(r.name)}</strong>
            <small>
              ${c(u.get(r.category_id)||"")}
              · ${c(r.stage_name||"")}
            </small>
          </div>

          <div class="finalist-actions">
            <button data-edit="${c(r.id)}" class="small-btn">EDIT</button>
            <button
              data-toggle="${c(r.id)}"
              data-state="${r.active}"
              class="small-btn">
              ${r.active?"HIDE":"SHOW"}
            </button>

            <button
              data-delete="${c(r.id)}"
              class="small-btn danger">
              DELETE
            </button>
          </div>
        </div>
      `).join(""):"<p>No finalists yet. Add one using the form above.</p>";const{data:p,error:f}=await d.rpc("admin_vote_results");f?document.getElementById("results").textContent="Results unavailable: "+f.message:document.getElementById("results").innerHTML=p?.length?p.map(r=>`
          <div class="result-row">
            <span>${c(r.name)}</span>
            <strong>${Number(r.vote_count)||0} VOTES</strong>
          </div>
        `).join(""):"<p>No votes yet.</p>"}if(!I)i("Supabase is not configured. Check your environment settings.","error"),document.querySelector("#login-form button").disabled=!0;else{document.getElementById("login-form").onsubmit=async a=>{a.preventDefault();const{error:t}=await d.auth.signInWithPassword({email:n("email"),password:n("password")});if(t){i(t.message,"error");return}try{if(!await m()){await d.auth.signOut(),i("This user is not an authorized Nadanu organizer.","error");return}v(!0),await g()}catch(e){i(e.message,"error")}},document.getElementById("logout").onclick=async()=>{await d.auth.signOut(),v(!1),i("Signed out.")},document.getElementById("event-form").onsubmit=async a=>{a.preventDefault();const t=n("event-status"),e=n("starts-at"),s=n("ends-at"),l=document.getElementById("save-status");if(!["draft","open","closed"].includes(t)){i("Invalid voting status.","error");return}if(e&&s&&new Date(s)<=new Date(e)){i("End date must be later than start date.","error");return}l.disabled=!0,l.textContent="SAVING STATUS…";try{if(!await m())throw new Error("Admin session expired. Please log in again.");const{data:u,error:p}=await d.from("voting_events").update({status:t,starts_at:e?new Date(e).toISOString():null,ends_at:s?new Date(s).toISOString():null,updated_at:new Date().toISOString()}).eq("id",1).select("id,status,starts_at,ends_at").maybeSingle();if(p)throw p;if(!u)throw new Error("Status was not saved. Check Supabase admin permissions and RLS policies.");if(u.status!==t)throw new Error("Saved status does not match the selected status.");if(await g(),n("event-status")!==t)throw new Error("Database status changed unexpectedly. Please reload.");i(`VOTING STATUS UPDATED TO ${t.toUpperCase()}.`,"success")}catch(u){i("Failed to save voting status: "+u.message,"error")}finally{l.disabled=!1,l.textContent="SAVE VOTING STATUS"}},document.getElementById("contestant-form").onsubmit=async a=>{a.preventDefault();try{if(!await m())throw new Error("Admin session expired.");const{error:t}=await d.from("contestants").insert({category_id:n("category"),name:n("name"),stage_name:n("stage-name"),performance_title:n("performance-title"),image_url:n("image-url")||null,sort_order:Number(n("sort-order")),active:!0});if(t)throw t;a.target.reset(),await g(),i("Finalist added.","success")}catch(t){i(t.message,"error")}},document.getElementById("finalists").onclick=async a=>{const t=a.target.closest("[data-edit],[data-delete],[data-toggle]");if(t){if(t.dataset.edit){const e=y.find(l=>l.id===t.dataset.edit);if(!e)return;const s={"edit-id":e.id,"edit-category":e.category_id,"edit-name":e.name,"edit-stage-name":e.stage_name||"","edit-performance-title":e.performance_title||"","edit-image-url":e.image_url||"","edit-sort-order":e.sort_order};for(const[l,u]of Object.entries(s))document.getElementById(l).value=u;document.getElementById("edit-panel").hidden=!1,document.getElementById("edit-panel").scrollIntoView({behavior:"smooth"});return}try{if(!await m())throw new Error("Admin session expired.");let e;if(t.dataset.delete){if(!confirm("Delete this finalist? Existing votes may also be deleted."))return;({error:e}=await d.from("contestants").delete().eq("id",t.dataset.delete))}else({error:e}=await d.from("contestants").update({active:t.dataset.state!=="true"}).eq("id",t.dataset.toggle));if(e)throw e;await g(),i("Finalist updated.","success")}catch(e){i(e.message,"error")}}},document.getElementById("cancel-edit").onclick=()=>{document.getElementById("edit-panel").hidden=!0},document.getElementById("edit-form").onsubmit=async a=>{a.preventDefault();try{if(!await m())throw Error("Admin session expired. Sign in again.");const{data:t,error:e}=await d.from("contestants").update({category_id:n("edit-category"),name:n("edit-name"),stage_name:n("edit-stage-name"),performance_title:n("edit-performance-title"),image_url:n("edit-image-url")||null,sort_order:Number(n("edit-sort-order"))}).eq("id",n("edit-id")).select("id").maybeSingle();if(e)throw e;if(!t)throw Error("Finalist was not updated. Check admin access.");document.getElementById("edit-panel").hidden=!0,await g(),i("Finalist updated successfully.","success")}catch(t){i(t.message,"error")}};async function o(){if(!await m())throw Error("Admin session expired.");const{data:a,error:t}=await d.rpc("admin_list_voter_records");if(t)throw t;b=a||[],document.getElementById("voter-records").innerHTML=b.length?b.map(e=>`<div class="finalist-row"><div><strong>${c(e.finalist_name)}</strong><small>${c(new Date(e.voted_at).toLocaleString())} · Device ref: ${c(e.device_reference)}</small></div><button class="small-btn danger" type="button" data-reset="${c(e.vote_id)}">RESET VOTE</button></div>`).join(""):"<p>No votes recorded.</p>"}document.getElementById("load-votes").onclick=()=>o().catch(a=>i(a.message,"error")),document.getElementById("voter-records").onclick=a=>{const t=a.target.closest("[data-reset]");if(!t)return;const e=b.find(s=>s.vote_id===t.dataset.reset);e&&(document.getElementById("reset-vote-id").value=e.vote_id,document.getElementById("reset-selection").textContent="Selected: "+e.finalist_name+" · "+new Date(e.voted_at).toLocaleString()+" · "+e.device_reference,document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!1)},document.getElementById("cancel-reset").onclick=()=>{document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!0},document.getElementById("reset-form").onsubmit=async a=>{a.preventDefault();const t=n("reset-vote-id");if(!b.some(s=>s.vote_id===t)){i("Invalid selected vote.","error");return}if(!confirm("Permanently reset only the selected vote? This allows the browser/session to vote again and is audit logged."))return;const e=document.getElementById("confirm-reset");e.disabled=!0;try{if(!await m())throw Error("Admin session expired.");const{data:s,error:l}=await d.functions.invoke("admin-reset-vote",{body:{vote_id:t,email:n("reset-email"),password:n("reset-password")}});if(l){let u=l.message;try{u=(await l.context?.json())?.error||u}catch{}throw Error(u)}if(!s?.ok)throw Error(s?.error||"Reset was not confirmed.");document.getElementById("reset-form").hidden=!0,await g(),await o(),i("Selected vote reset. Audit log updated.","success")}catch(s){i("Vote reset failed: "+s.message,"error")}finally{e.disabled=!1,document.getElementById("reset-password").value=""}},document.getElementById("refresh").onclick=()=>g().catch(a=>i(a.message,"error")),m().then(async a=>{a&&(v(!0),await g())}).catch(a=>{i(a.message,"error")})}
