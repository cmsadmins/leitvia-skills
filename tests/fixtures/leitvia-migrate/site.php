<?php
/**
 * Fixture of the skill leitvia-migrate: a small bakery site as a classic theme leaves it behind. Three pages and four
 * posts in classic HTML (no block comments) with images, lists, a table and an embedded video, and a classic menu with
 * a submenu. Run as a blueprint step after dev/playground/blueprint.json:
 *
 *   { "step": "runPHP", "code": "<?php require '/leitvia-fixtures/leitvia-migrate/site.php';" }
 *
 * It also writes the application password of user 1 to /leitvia-run/admin-password.txt (the person at a checkpoint)
 * and the IDs it created to /leitvia-run/fixture.json. All texts are written for this fixture.
 *
 * @package LeitviaSkills
 */

require_once '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

// Classic content as an editor with unfiltered_html saved it; kses would strip the iframe.
kses_remove_filters();
// Uploads without year and month folders, so scenarios can name the image URLs (/wp-content/uploads/<name>.png).
update_option( 'uploads_use_yearmonth_folders', 0 );

/**
 * Adds a generated PNG to the media library.
 *
 * @param string $name  File name without extension.
 * @param int[]  $color RGB.
 * @param string $alt   Alt text, empty for none.
 * @return int Attachment ID.
 */
function leitvia_fixture_image( string $name, array $color, string $alt ): int {
	$uploads = wp_upload_dir();
	$file    = $uploads['path'] . '/' . $name . '.png';
	$image   = imagecreatetruecolor( 960, 640 );
	imagefill( $image, 0, 0, imagecolorallocate( $image, $color[0], $color[1], $color[2] ) );
	imagepng( $image, $file );
	$id = wp_insert_attachment(
		array(
			'post_title'     => $name,
			'post_mime_type' => 'image/png',
			'post_status'    => 'inherit',
		),
		$file
	);
	wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $file ) );
	if ( '' !== $alt ) {
		update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	}
	return $id;
}

$loaf  = leitvia_fixture_image( 'sourdough-loaf', array( 180, 130, 80 ), 'A round sourdough loaf with a dark crust on a wooden board' );
$oven  = leitvia_fixture_image( 'stone-oven', array( 90, 60, 40 ), '' );
$flour = leitvia_fixture_image( 'flour-sacks', array( 230, 220, 200 ), 'Three paper sacks of flour stacked by the bakery door' );
$src   = static fn( int $id ): string => (string) wp_get_attachment_url( $id );

$pages = array(
	'about-us'      => array(
		'About us',
		"Harbour Bakery opened in 2009 in a former net shed at the old harbour. Today six bakers work here, three of them since the first winter.\n\n<h2>What we bake</h2>\nWe bake bread, rolls and a few cakes every night. Everything is made on site from flour, water, salt and time.\n\n<img class=\"alignnone size-large wp-image-{$flour}\" src=\"{$src( $flour )}\" alt=\"Three paper sacks of flour stacked by the bakery door\" width=\"960\" height=\"640\" />\n\n<h2>Who we work with</h2>\n<ul>\n<li>Two mills within 80 kilometres</li>\n<li>A dairy farm for butter and milk</li>\n<li>The harbour market for fruit in summer</li>\n</ul>",
	),
	'opening-hours' => array(
		'Opening hours',
		"The shop opens early, the bread is ready from the first hour.\n\n<table>\n<thead>\n<tr><th>Day</th><th>Shop</th><th>Cafe</th></tr>\n</thead>\n<tbody>\n<tr><td>Monday to Friday</td><td>6:30 to 18:00</td><td>8:00 to 17:00</td></tr>\n<tr><td>Saturday</td><td>7:00 to 14:00</td><td>8:00 to 13:00</td></tr>\n<tr><td>Sunday</td><td>closed</td><td>closed</td></tr>\n</tbody>\n</table>\n\nOn public holidays we open as on Saturday.",
	),
	'contact'       => array(
		'Contact',
		"You find us at Harbour Street 4, right next to the ferry pier.\n\n<h2>Orders</h2>\nFor larger orders write to <a href=\"mailto:orders@example.org\">orders@example.org</a> two days ahead. Please tell us:\n<ol>\n<li>what you need and how many,</li>\n<li>the day and hour you want to collect it,</li>\n<li>a phone number for questions.</li>\n</ol>",
	),
);

$posts = array(
	'our-new-sourdough'        => array(
		'Our new sourdough',
		"After two years of trials our new sourdough is on the shelf. It rises for 36 hours and keeps fresh for a week.\n\n<img class=\"aligncenter size-large wp-image-{$loaf}\" src=\"{$src( $loaf )}\" alt=\"A round sourdough loaf with a dark crust on a wooden board\" width=\"960\" height=\"640\" />\n\n<h2>Why it takes so long</h2>\nThe long rise gives the bread its taste and makes it easier to digest. It needs only four things:\n<ul>\n<li>rye and wheat flour</li>\n<li>water</li>\n<li>salt</li>\n<li>our starter from 2009</li>\n</ul>",
	),
	'a-night-at-the-oven'      => array(
		'A night at the oven',
		"Our day starts at ten in the evening, when the first dough comes out of the fridge.\n\n[caption id=\"attachment_{$oven}\" align=\"alignnone\" width=\"960\"]<img class=\"size-large wp-image-{$oven}\" src=\"{$src( $oven )}\" alt=\"\" width=\"960\" height=\"640\" /> The stone oven at four in the morning[/caption]\n\n<h3>The order of the night</h3>\n<ol>\n<li>Shape the rye loaves.</li>\n<li>Heat the stone oven to 260 degrees.</li>\n<li>Bake the rye, then the wheat, then the rolls.</li>\n</ol>\n\n<blockquote>The oven tells you when it is ready, not the clock.</blockquote>",
	),
	'video-shaping-a-loaf'     => array(
		'Video: shaping a loaf',
		"Our head baker shows in four minutes how she shapes a round loaf.\n\n<iframe title=\"Shaping a round loaf\" width=\"560\" height=\"315\" src=\"https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ\" frameborder=\"0\" allowfullscreen></iframe>\n\nWatch how little flour she uses on the table.",
	),
	'the-flour-we-use'         => array(
		'The flour we use',
		"Every flour has its own job in the bakery.\n\n<table>\n<tbody>\n<tr><td><strong>Flour</strong></td><td><strong>Mill</strong></td><td><strong>Used for</strong></td></tr>\n<tr><td>Rye 1150</td><td>North Mill</td><td>Sourdough and rye loaves</td></tr>\n<tr><td>Wheat 550</td><td>River Mill</td><td>Rolls and white bread</td></tr>\n<tr><td>Spelt 630</td><td>River Mill</td><td>Spelt loaf on Fridays</td></tr>\n</tbody>\n</table>\n\n<em>Both mills grind to order, so the flour is never older than two weeks.</em>",
	),
);

$ids = array(
	'images' => array(
		'loaf'  => $loaf,
		'oven'  => $oven,
		'flour' => $flour,
	),
);
foreach ( array(
	'page' => $pages,
	'post' => $posts,
) as $type => $items ) {
	foreach ( $items as $slug => $item ) {
		$ids[ $type ][ $slug ] = wp_insert_post(
			array(
				'post_type'    => $type,
				'post_status'  => 'publish',
				'post_author'  => 1,
				'post_name'    => $slug,
				'post_title'   => $item[0],
				'post_content' => $item[1],
			),
			true
		);
	}
}

// Classic menu with a submenu, in the location of the old theme.
$menu   = wp_create_nav_menu( 'Main menu' );
$add    = static fn( array $item ): int => (int) wp_update_nav_menu_item( $menu, 0, $item + array( 'menu-item-status' => 'publish' ) );
$add_to = static fn( string $slug, int $parent = 0, string $type = 'page' ): int => $add(
	array(
		'menu-item-object-id' => $ids[ $type ][ $slug ],
		'menu-item-object'    => $type,
		'menu-item-type'      => 'post_type',
		'menu-item-parent-id' => $parent,
	)
);
$add(
	array(
		'menu-item-title'  => 'Home',
		'menu-item-url'    => home_url( '/' ),
		'menu-item-type'   => 'custom',
	)
);
$about = $add_to( 'about-us' );
$add_to( 'opening-hours', $about );
$add_to( 'contact', $about );
$add_to( 'our-new-sourdough', 0, 'post' );
set_theme_mod( 'nav_menu_locations', array( 'primary' => $menu ) );
$ids['menu'] = $menu;

// Brand of the old theme as the Customizer stored it, for the inventory of the person.
update_option(
	'theme_mods_harbour-classic',
	array(
		'background_color'  => 'fbf7f0',
		'header_textcolor'  => '3b2a1a',
		'link_color'        => '#a0461e',
		'nav_menu_locations' => array( 'primary' => $menu ),
	)
);
update_option( 'blogname', 'Harbour Bakery' );

$admin = WP_Application_Passwords::create_new_application_password( 1, array( 'name' => 'scenario' ) );
file_put_contents( '/leitvia-run/admin-password.txt', $admin[0] . "\n" );
file_put_contents( '/leitvia-run/fixture.json', wp_json_encode( $ids, JSON_PRETTY_PRINT ) . "\n" );
