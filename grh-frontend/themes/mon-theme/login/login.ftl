<#-- Login 100% custom GerAI -->

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Connexion - GerAI</title>

    <!-- Favicon -->
    <link rel="icon" type="image/png"
          href="${url.resourcesPath}/img/Favicon.png"/>

    <!-- CSS -->
    <link rel="stylesheet"
          href="${url.resourcesPath}/css/style.css"/>
</head>

<body>

<div class="login-wrapper">

    <div class="login-card">

        <img src="${url.resourcesPath}/img/GerAI.png"
             alt="GerAI"
             class="login-logo"/>

        <h2>Connexion</h2>

        <form action="${url.loginAction}" method="post">

            <input type="text"
                   name="username"
                   placeholder="Nom d'utilisateur"
                   required />

            <input type="password"
                   name="password"
                   placeholder="Mot de passe"
                   required />

            <button type="submit">
                Se connecter
            </button>

        </form>

    </div>

</div>

</body>
</html>