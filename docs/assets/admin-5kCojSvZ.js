import{l as h,f as E,c as w,s,a as r,b as d}from"./shared-C8pliTzj.js";const y=document.getElementById("app");y.innerHTML=`
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
  </section>
</main>

${E()}
`;function p(t){document.getElementById("login").hidden=t,document.getElementById("dashboard").hidden=!t}function o(t){return document.getElementById(t).value.trim()}function f(t){if(!t)return"";const e=new Date(t),a=i=>String(i).padStart(2,"0");return`${e.getFullYear()}-${a(e.getMonth()+1)}-${a(e.getDate())}T${a(e.getHours())}:${a(e.getMinutes())}`}async function m(){const{data:t,error:e}=await r.auth.getUser();if(e||!t?.user||t.user.is_anonymous)return!1;const{data:a,error:i}=await r.from("admin_roles").select("role").eq("user_id",t.user.id).maybeSingle();if(i)throw i;return!!a}async function c(){const[{data:t,error:e},{data:a,error:i},{data:l,error:u}]=await Promise.all([r.from("categories").select("id,slug,name").order("name"),r.from("contestants").select("id,name,stage_name,performance_title,sort_order,active,category_id").order("sort_order"),r.from("voting_events").select("id,status,starts_at,ends_at").eq("id",1).maybeSingle()]);if(e||i||u)throw e||i||u;if(!l)throw new Error("Voting event not found. Check voting_events table.");const g=new Map((t||[]).map(n=>[n.id,n.name]));document.getElementById("category").innerHTML=(t||[]).map(n=>`<option value="${d(n.id)}">${d(n.name)}</option>`).join(""),document.getElementById("event-status").value=l.status,document.getElementById("starts-at").value=f(l.starts_at),document.getElementById("ends-at").value=f(l.ends_at),document.getElementById("finalists").innerHTML=a?.length?a.map(n=>`
        <div class="finalist-row">
          <div>
            <strong>${d(n.name)}</strong>
            <small>
              ${d(g.get(n.category_id)||"")}
              · ${d(n.stage_name||"")}
            </small>
          </div>

          <div class="finalist-actions">
            <button
              data-toggle="${d(n.id)}"
              data-state="${n.active}"
              class="small-btn">
              ${n.active?"HIDE":"SHOW"}
            </button>

            <button
              data-delete="${d(n.id)}"
              class="small-btn danger">
              DELETE
            </button>
          </div>
        </div>
      `).join(""):"<p>No finalists yet. Add one using the form above.</p>";const{data:v,error:b}=await r.rpc("admin_vote_results");b?document.getElementById("results").textContent="Results unavailable: "+b.message:document.getElementById("results").innerHTML=v?.length?v.map(n=>`
          <div class="result-row">
            <span>${d(n.name)}</span>
            <strong>${Number(n.vote_count)||0} VOTES</strong>
          </div>
        `).join(""):"<p>No votes yet.</p>"}w?(document.getElementById("login-form").onsubmit=async t=>{t.preventDefault();const{error:e}=await r.auth.signInWithPassword({email:o("email"),password:o("password")});if(e){s(e.message,"error");return}try{if(!await m()){await r.auth.signOut(),s("This user is not an authorized Nadanu organizer.","error");return}p(!0),await c()}catch(a){s(a.message,"error")}},document.getElementById("logout").onclick=async()=>{await r.auth.signOut(),p(!1),s("Signed out.")},document.getElementById("event-form").onsubmit=async t=>{t.preventDefault();const e=o("event-status"),a=o("starts-at"),i=o("ends-at"),l=document.getElementById("save-status");if(!["draft","open","closed"].includes(e)){s("Invalid voting status.","error");return}if(a&&i&&new Date(i)<=new Date(a)){s("End date must be later than start date.","error");return}l.disabled=!0,l.textContent="SAVING STATUS…";try{if(!await m())throw new Error("Admin session expired. Please log in again.");const{data:u,error:g}=await r.from("voting_events").update({status:e,starts_at:a?new Date(a).toISOString():null,ends_at:i?new Date(i).toISOString():null,updated_at:new Date().toISOString()}).eq("id",1).select("id,status,starts_at,ends_at").maybeSingle();if(g)throw g;if(!u)throw new Error("Status was not saved. Check Supabase admin permissions and RLS policies.");if(u.status!==e)throw new Error("Saved status does not match the selected status.");if(await c(),o("event-status")!==e)throw new Error("Database status changed unexpectedly. Please reload.");s(`VOTING STATUS UPDATED TO ${e.toUpperCase()}.`,"success")}catch(u){s("Failed to save voting status: "+u.message,"error")}finally{l.disabled=!1,l.textContent="SAVE VOTING STATUS"}},document.getElementById("contestant-form").onsubmit=async t=>{t.preventDefault();try{if(!await m())throw new Error("Admin session expired.");const{error:e}=await r.from("contestants").insert({category_id:o("category"),name:o("name"),stage_name:o("stage-name"),performance_title:o("performance-title"),image_url:o("image-url")||null,sort_order:Number(o("sort-order")),active:!0});if(e)throw e;t.target.reset(),await c(),s("Finalist added.","success")}catch(e){s(e.message,"error")}},document.getElementById("finalists").onclick=async t=>{const e=t.target.closest("[data-delete],[data-toggle]");if(e)try{if(!await m())throw new Error("Admin session expired.");let a;if(e.dataset.delete){if(!confirm("Delete this finalist? Existing votes may also be deleted."))return;({error:a}=await r.from("contestants").delete().eq("id",e.dataset.delete))}else({error:a}=await r.from("contestants").update({active:e.dataset.state!=="true"}).eq("id",e.dataset.toggle));if(a)throw a;await c(),s("Finalist updated.","success")}catch(a){s(a.message,"error")}},document.getElementById("refresh").onclick=()=>c().catch(t=>s(t.message,"error")),m().then(async t=>{t&&(p(!0),await c())}).catch(t=>{s(t.message,"error")})):(s("Supabase is not configured. Check your environment settings.","error"),document.querySelector("#login-form button").disabled=!0);
