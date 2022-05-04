const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("learn")
        .setDescription("Give you useful links to learn different programming languages or technologies")
        .addStringOption(option => option.setName("techno").setDescription("The technology you want to get the links to learn").setRequired(true)
            .addChoices({
                name: "C",
                value: "C"
            }, {
                name: "C++",
                value: "C++"
            }, {
                name: "C#",
                value: "C#"
            }, {
                name: "Discord.js",
                value: "Discord.js"
            }, {
                name: "Git",
                value: "Git"
            }, {
                name: "HTML / CSS",
                value: "HTML / CSS"
            }, {
                name: "Java",
                value: "Java"
            }, {
                name: "JavaScript",
                value: "JavaScript"
            }, {
                name: "PHP",
                value: "PHP"
            }, {
                name: "Python",
                value: "Python"
            }, {
                name: "Reverse engineering",
                value: "Reverse engineering"
            }, {
                name: "Rust",
                value: "Rust"
            })
        ),
    guildOnly: false,

    async execute(bot, interaction) {
        const techno = interaction.options.getString("techno")

        const linksEmbed = new MessageEmbed()
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        if (techno === "C") {
            linksEmbed
                .setTitle(t("learn_c"))
                .addField(t("english"), `[${t("complete_book")}](https://books.goalkicker.com/CBook/)\n[${t("documentation")}](https://devdocs.io/c/)`)
                .addField(t("french"), `[Zeste de Savoir](https://zestedesavoir.com/tutoriels/755/le-langage-c-1/)\n[${t("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfEh6PCE39HERGgbbaIHhy4j)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/C_Programming_Language.svg/1200px-C_Programming_Language.svg.png")
                .setColor("#6666FF")
        }
        else if (techno === "C++") {
            linksEmbed
                .setTitle(t("learn_cpp"))
                .addField(t("english"), `[${t("complete_book")}](https://books.goalkicker.com/CPlusPlusBook/)\n[${t("documentation")}](https://en.cppreference.com/w/)`)
                .addField(t("french"), `[Zeste de Savoir](https://zestedesavoir.com/tutoriels/822/la-programmation-en-c-moderne/) (${t("create_account_to_access_beta")})\n[${t("video_formation")}](https://youtube.com/playlist?list=PLrSOXFDHBtfFKOzlm5iCBeXDTLxXdmxpx) (${t("not_finished")})`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1200px-ISO_C%2B%2B_Logo.svg.png")
                .setColor("#6666FF")
        }
        else if (techno === "C#") {
            linksEmbed
                .setTitle(t("learn_csharp"))
                .addField(t("english"), `[${t("microsoft_learning_cs_material")}](https://dotnet.microsoft.com/learn/csharp)\n[C# 101](https://www.youtube.com/playlist?list=PLdo4fOcmZ0oVxKLQCHpiUWun7vlJJvUiN)\n[${t("documentation")} C#](https://docs.microsoft.com/en-us/dotnet/csharp/)\n[ASP.NET](https://docs.microsoft.com/en-us/aspnet/)`)
                .addField(t("french"), `[${t("documentation")} C#](https://docs.microsoft.com/fr-fr/dotnet/csharp/)\n[ASP.NET](https://docs.microsoft.com/fr-fr/aspnet/)\n[${t("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfGBHAMEg9Om9nF_7R7h5mO7) (${t("not_finished")})`)
                .setThumbnail("https://seeklogo.com/images/C/c-sharp-c-logo-02F17714BA-seeklogo.com.png")
                .setColor("#AA33FF")
        }
        else if (techno === "Discord.js") {
            linksEmbed
                .setTitle(t("learn_discordjs"))
                .addField(t("english"), `[${t("complete_course")}](https://discordjs.guide/)\n[${t("documentation")}](https://discord.js.org/#/docs/main/stable/general/welcome)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/fr/thumb/0/05/Discord.svg/1200px-Discord.svg.png")
                .setColor("#7777FF")
        }
        else if (techno === "Git") {
            linksEmbed
                .setTitle(t("learn_git"))
                .addField(t("english"), `[${t("official_book")}](https://git-scm.com/book/en/v2)\n[Atlassian guide](https://www.atlassian.com/git)`)
                .addField(t("french"), `[${t("official_book")}](https://git-scm.com/book/fr/v2) (${t("english_version_translation")})\n[${t("video_formation")}](https://youtu.be/CEb_JM_hsFw)`)
                .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/778355939833151488/5847f981cef1014c0b5e48be.png")
                .setColor("#DE4C36")
        }
        else if (techno === "HTML / CSS") {
            linksEmbed
                .setTitle(t("learn_html"))
                .addField(t("english"), `[${t("mdn_guide")}](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web)\n[${t("interneting_is_hard")}](https://www.internetingishard.com/)\n[${t("freecodecamp")}](https://www.freecodecamp.org/)\n[${t("html_book")}](https://www.freecodecamp.org/)\n[${t("css_book")}](https://books.goalkicker.com/CSSBook/)\n[${t("marksheet")}](https://marksheet.io/)\n[${t("mdn")}](https://developer.mozilla.org/en/)`)
                .addField(t("french"), `[${t("mdn_guide")}](https://developer.mozilla.org/fr/docs/Apprendre/Commencer_avec_le_web)\n[${t("grafikart_html")}](https://grafikart.fr/formations/html)\n[${t("grafikart_css")}](https://grafikart.fr/formations/css)\n[${t("mdn")}](https://developer.mozilla.org/fr/)`)
                .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/805771805741547590/htmlcss.png")
                .setColor("#E44D26")
        }
        else if (techno === "Java") {
            linksEmbed
                .setTitle(t("learn_java"))
                .addField(t("english"), `[${t("complete_book")}](https://books.goalkicker.com/JavaBook/)\n[${t("documentation")}](https://docs.oracle.com/javase)`)
                .addField(t("french"), `[${t("complete_course")}](https://koor.fr/Java/Tutorial/Index.wp) (${t("also_available")} [${t("on_youtube")}](https://www.youtube.com/playlist?list=PLBNheBxhHLQxfJhoz193-dRwvc2rl8AOW) ${t("as_video_formation")})\n[${t("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfHkq8dd3BbSaopVgRSYtgPv) (${t("not_finished")})`)
                .setThumbnail("http://assets.stickpng.com/images/58480979cef1014c0b5e4901.png")
                .setColor("#EA2D2E")
        }
        else if (techno === "JavaScript") {
            linksEmbed
                .setTitle(t("learn_javascript"))
                .addField(t("english"), `[JavaScript.info](https://javascript.info/)\n[${t("complete_book")}](https://books.goalkicker.com/JavaScriptBook/)\n[${t("nodejs_book")}](https://books.goalkicker.com/NodeJSBook/)`)
                .addField(t("french"), `[${t("mozilla_guide")}](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide)`)
                .setThumbnail("https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png")
                .setColor("#E4B400")
        }
        else if (techno === "PHP") {
            linksEmbed
                .setTitle(t("learn_php"))
                .addField(t("english"), `[PHP the right way](https://phptherightway.com/)\n[${t("php_security_checklist")}](https://www.sqreen.com/checklists/php-security-checklist)\n[${t("documentation")}](https://www.php.net/docs.php)`)
                .addField(t("french"), `[PHP the right way](https://eilgin.github.io/php-the-right-way/) (${t("english_version_translation")})\n[${t("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfFuZttC17M-jNpKnzUL5Adc)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/1024px-PHP-logo.svg.png")
                .setColor("#9999FF")
        }
        else if (techno === "Python") {
            linksEmbed
                .setTitle(t("learn_python"))
                .addField(t("english"), `[${t("complete_book")}](https://books.goalkicker.com/PythonBook/)\n[${t("documentation")}](https://docs.python.org/3/)`)
                .addField(t("french"), `[${t("pdf_course")}](https://inforef.be/swi/download/apprendre_python3_5.pdf)\n[${t("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfHg8fWBd7sKPxEmahwyVBkC)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png")
                .setColor("#6666FF")
        }
        else if (techno === "Reverse engineering") {
            linksEmbed
                .setTitle(t("learn_reverse"))
                .addField(t("some_tools"), "[GDB](https://www.gnu.org/software/gdb/)\n[IDA](https://www.hex-rays.com/products/ida/)\n[Radare2](https://rada.re/)\n[Java Decompiler](http://java-decompiler.github.io/)")
                .addField(t("english"), `[${t("reverse_for_beginners")}](https://www.begin.re/)\n[${t("x86_nasm_by_example")}](https://asmtutor.com/)\n[${t("what_is_a_linux_executable")}](https://fasterthanli.me/blog/2020/whats-in-a-linux-executable/)\n[Crackmes](https://crackmes.one/)`)
                .addField(t("french"), `[${t("nasm_x86_course")}](http://www.pageperso.lif.univ-mrs.fr/~alexis.nasr/Ens/Compilation/cm06_x86.pdf)\n[Hackndo](https://beta.hackndo.com/archives/) (${t("contains_many_articles")})`)
                .setThumbnail("https://cdn.icon-icons.com/icons2/1155/PNG/512/1486564730-gears-cogs_81537.png")
                .setColor("#888888")
        }
        else if (techno === "Rust") {
            linksEmbed
                .setTitle(t("learn_rust"))
                .addField(t("english"), `[${t("official_book")}](https://doc.rust-lang.org/book/)\n[${t("official_course_by_example")}](https://doc.rust-lang.org/stable/rust-by-example/)\n[Are we game yet?](http://arewegameyet.com/) (${t("game_development")})\n[${t("documentation")}](https://doc.rust-lang.org/std/)`)
                .addField(t("french"), `[${t("guillaume_gomez_blog")}](https://blog.guillaume-gomez.fr/Rust/)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
                .setColor("#555555")
        }
        else {
            return interaction.reply({ content: `${t("no_learn_entry")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        interaction.reply({ embeds: [linksEmbed] })
    }
}