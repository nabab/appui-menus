<?php
$ctrl
  ->combo(_("Menu Configurator"), [
    'rootPermission' => $ctrl->inc->options->fromCode('page', 'permission', 'appui'),
    'defaultMenu' => $ctrl->inc->menu->getDefault(),
    'menus' => $ctrl->inc->menu->getMenus('name', 'id')
  ])
  ->setColor('#54aedb', '#FFF')
  ->setIcon('nf nf-fa-bars');