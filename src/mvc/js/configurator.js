(() => {
  return {
    /**
     * [data initial]
     * @return {object}
     */
    data(){
      return {
        //for  orientation spitter
        orientation: 'horizontal',
        classOrientation: 'fas fa-arrows-v',
        selected: false,
        currentMenu: '',
        oldRootMenu: '',
        rootPermission: this.source.id_permission,
        //id options menus conteiner
        id_parent: this.source.id_parent,
        id_default: this.source.id_default,
        list: this.source.listMenu,
        root: this.source.root,
        //info node at click for context menu
        node: null,
        droppables: [],
        idxListMenu: -1,
        nameSection: '',
        emptyMenuCurrent: null,
        viewButtonAlias: false,
        formData:{
          create: false
        },
        iconDefault: 'fas fa-cog'
      }
    },
    computed: {
      /**
       * this make list of all menus
       *
       * @computed listMenu
       * @return {Array}
       */
      //Always updated list of menus visible on the dropdown
      listMenu(){
        let menus = [];
        if ( this.list && this.list.length ){
          for ( let ele of this.$data.list ){
            if ( (ele.code !== "shortcuts")  ){
              menus.push({
                text: ele.text,
                value: ele.id
              });
            }
          };
        }
        return menus
      },
      /**
       * check if there are more menus if it returns true the arrows will appear to scroll through the list
       *
       * @computed listMenu
       * @return {Boolean}
       */
      showArrows(){
        if( this.listMenu.length > 2 ){
          return true
        }
        return false
      },
      /*
       * Get Current name of the selected menu from the dprodown list
       *
       * @computed nameMenu
       * @return {String}
       */
      nameMenu(){
        let name = "";
        if ( this.currentMenu !== "" ){
          for ( let ele of this.listMenu ){
            if ( ele.value === this.currentMenu ){
              name = ele.text;
            }
          }
        }
        return name
      }
    },
    methods: {
      /** CONTEXTMENU **/
      /*
       * Returns an array for the context menu of the menu tree (right splitter)
       *
       * @method contextMenu
       * @fires deleteElement
       * @fires renameElement
       * @fires addTempNode
       * @fires copyTo
       */
      contextMenu(){
        let ctx =  [
          //for delete
          {
            icon: 'far fa-trash-alt',
            text: bbn._('Delete'),
            command: node => {
              this.node = node;
              //params: id node , text node, false for define that is not menu
              this.deleteElement(node.data.id , node.text, false);
            }
          },
          //for rename
          {
            icon: 'fas fa-pencil-alt',
            text: bbn._('Rename'),
            command: node => {
              this.node = node;
              this.renameElement(false, node.data.id, node.text, false, node.icon);
            }
          }
        ];
        //case context in section menu
        if ( arguments[0].data.id_alias === null ){
          //adds the possibility of create sub-section
          ctx.unshift({
              icon: 'fas fa-level-down-alt',
              text: bbn._('Sub-section'),
              command: node => {
                this.node = node;
                this.addTempNode(node, {
                  text: bbn._('New Section'),
                  id_parent: node.data.id,
                  id_alias: null,
                  icon: this.iconDefault,
                  numChildren: 0
                });
              }
            });
          //adds the possibility of create a link
          ctx.unshift({
            icon: 'fas fa-link',
            text: bbn._('New link'),
            command: node => {
              this.node = node;
              if ( node.data.id_alias === null){
                let obj = {
                  text: bbn._('My text'),
                  id_parent: node.data.id,
                  id_alias: 1,
                  icon: this.iconDefault,
                }
                this.addTempNode(node, obj)
              }
            }
          });
          //adds the possibility of copy the section to another menu
          ctx.push({
            icon: 'fas fa-copy',
            text: bbn._('Copy to'),
            command: node => {
              this.copyTo({
                text: node.data.text,
                id: node.data.id
              });
            }
          });
        }
        return ctx
      },
      /**METHODS FOR BUTTONS ACTIONS IN THE TOP SPLITER LEFT **/

      /*
       * Create a new menu, this is operated by the top-bar button "create menu"
       *
       * @method createMenu
       *
       * @fires actionedPopUp
       */
      createMenu(){
        let dim = {
          width: 300,
          height: 180
        },
          //source for create menu
        cfg = {
          root: this.root,
          id_parent: this.id_parent,
        };
        //this method returns a popup with the component that we call in the first parameter
        this.actionedPopUp('appui-menu-popup-new_menu', bbn._('Create new menu'), cfg, dim);
      },
      /*
       * Copy a menu, this is operated by the top-bar button "copy menu"
       *
       * @method copyMenu
       *
       * @fires actionedPopUp
       */
      copyMenu(){
        if ( this.currentMenu !== "" ){
          let dim = {
            width: 300,
            height: 180
          },
          cfg = {
            root: this.$data.root,
            titleMenu: this.nameMenu,
            id: this.currentMenu,
            id_parent: this.id_parent
          };
          this.actionedPopUp('appui-menu-popup-copy_menu', bbn._('Copy menu'), cfg, dim);
        }
      },
      /*
       * Temporarily adds a new section in root this is operated by the top-bar button "Copy menu"
       *
       * @method createSection
       *
       * @fires addTempNodeInRoot
       */
      createSection(){
      // add temporaney node in tree
       this.addTempNodeInRoot({
         text: bbn._('New Section'),
         id_parent: this.currentMenu,
         id_alias: null,
         icon: 'fas fa-cogs',
         numChildren: 0
       });
      },
      /*
       * Delete current menu this is operated by the top-bar button "Delete menu"
       *
       * @method deleteMenu
       *
       * @fires deleteElement
       */
      deleteMenu(){
        //passes the parameters of the current menu for delete
        this.deleteElement(this.currentMenu, this.nameMenu, true);
      },
      /*
       * Rename current menu this is operated by the top-bar button "Rename menu"
       *
       * @method renameMenu
       *
       * @fires renameElement
       */
      renameMenu(){
        //passes the parameters of the current menu for rename
        this.renameElement(true, this.currentMenu, this.nameMenu, this.id_parent);
      },
      /*
       * Create a new link in root of  current menu  set id_alias at 1 this is operated by the top-bar button "Create link"
       *
       * @method createLink
       *
       * @fires addTempNodeInRoot
       */
      createLink(){
        // add temporaney node in tree of the root menu with id_alias at 1 for create a link
        this.addTempNodeInRoot({
          text: bbn._('New text'),
          id_parent: this.currentMenu,
          id_alias: 1,
          icon: this.iconDefault,
          numChildren: 0
        });
      },
      /*
       * Copy the current menu and assign it to the root of another selected menu this is operated by the top-bar button "Copy menu to"
       *
       * @method copyMenuTo
       *
       * @fires copyto
       */
      copyMenuTo(){
        //accepts as parameter an object with id of the menu to be copied and where to copy it
        this.copyTo({
          text:this.nameMenu,
          id: this.currentMenu
        });
      },
      /*
       * Allows backward scrolling of the menu list one by one  this is operated by the top-bar button "back menu"
       *
       * @method prevMenu
       */
      prevMenu(){
        this.selected = false;
        this.idxListMenu--;
        //get last of the list if click at first of the list
        if ( this.idxListMenu === -1 ){
          this.idxListMenu = this.list.length -1;

        }
        if( this.idxListMenu <= this.list.length - 1 ){
          setTimeout(() =>{
            this.currentMenu = this.list[this.idxListMenu]['id'];
          }, 100);
        }
      },
      /*
       * Allows forward scrolling of the menu list, one by one  this is operated by the top-bar button "Next menu"
       *
       * @method nextMenu
       */
      nextMenu(){
        this.selected = false;
        this.idxListMenu++;
        if ( this.idxListMenu > this.list.length - 1  ){
          this.idxListMenu = 0;
        }
        if( this.idxListMenu <= this.list.length - 1 ){
          setTimeout(() => {
            this.currentMenu = this.list[this.idxListMenu]['id'];
          }, 100);
        }
      },
      /** ##ACTIONS **/

      /*
       * This method is invoked when you need to open an action pop-up, which receives the information to perform the requested action.
       *
       * @method actionedPopUp
       * @param {String} componet name of the component to include in the popup
       * @param {String} title  title popup
       * @param {Object} cfg source of the component we include
       * @param {Object} popup dimension poup ( width and height )
       */
      actionedPopUp(component, title, cfg , popup){
        bbn.vue.closest(this, ".bbns-tab").$refs.popup[0].open({
          width: popup.width,
          height: popup.height,
          title: title,
          component: component,
          source: cfg
        });
      },
      /*
       * Based on where is called, copy section or memu and  put in another root menu
       *
       * @method copyTo
       * @param {Object} ele contain name and id of section or menu to be copied
       * @fires actionedPopUp
       */
      copyTo(ele){
        let dim = {
          width: 300,
          height: 180
        },
        list = this.listMenu.filter( ele =>{
          return ele.value !== this.currentMenu;
        });
        if ( this.currentMenu !== "" ){
          let cfg = {
            root: this.source.root,
            name: ele.text,
            listMenu: list,
            id: ele.id
          };
          this.actionedPopUp('appui-menu-popup-copy_to', bbn._('Copy to'), cfg, dim);
        }
      },
      /*
       * Based on where is called, rename node o menu
       *
       * @method renameElement
       * @param {Booolean} menu true if rename menu, false if rename a node of tree
       * @fires actionedPopUp
       */
      renameElement(menu, current, text, id_parent, icon= false){
        if ( this.currentMenu !== "" ){
          let dim = {
            width: 300,
            height: 220
          },
          cfg = {
            root: this.root,
            titleMenu: text,
            idMenu: current,
            //information to understand whether we are renaming a menu or section
            menu: menu,
            id_parent: id_parent,
            icon: icon,
          };
          this.actionedPopUp('appui-menu-popup-rename', bbn._('Rename'), cfg, dim);
        }
      },
      /*
       * Based on where is called,  delete menu or node of the a tree
       *
       * @method deleteElement
       *
       * @param {String} idDelete id menu or node to be Deleted
       * @param {String} text name menu or node to be Deleted
       * @param {Booolean} menu true if delete menu, false if rename a node of tree
       *
       * @fires reloadTreeOfNode
       * @fires actionedPopUp
       */
       deleteElement(idDelete, text, menu){
        //checks if it has an id to make sure that you perform the delete action and that anyway this id is not that of the default menu
        if ( idDelete ){
          if ( idDelete === this.id_default ){
            appui.error( bbn._("The main menu cannot be deleted") + '!!' );
            return;
          }
          appui.confirm(
            bbn._('Secure to delete:""') + ' ' + text + '" ?',
            () => {
              bbn.fn.post(
                this.root + "actions/delete_element",
                {
                  id: idDelete,
                  id_default: this.id_default,
                  id_parent: menu ? this.id_parent : this.node.data.id_parent
                },
                (d) => {
                  if ( d.success ){
                    //If menu is set to true then you are deleting a menu
                  if ( menu ){
                      //the computed and on this property through which computed allows me to update the menu list in the dropdown
                      this.list = d.listMenu.length ? d.listMenu : [];
                      //returns to the initial state
                      if ( this.currentMenu === idDelete ){
                        setTimeout(() => {
                          this.currentMenu = this.list[this.list.length-1]['id'];
                          this.idxListMenu --;
                        }, 100);
                      }
                    }
                    //case delete node of a tree menu
                    else{
                      if ( this.node !== null ){
                        //case level at 0, modify items whitout reload
                        if ( this.node.level === 0 ){
                          bbn.fn.each( this.node['parent']['items'], (val, i)=>{
                            if ( idDelete === this.node['parent']['items'][i]['id'] ){
                              this.node['parent']['items'].splice(i, 1);
                              this.node = null;
                              return false;
                            }
                          });
                        }
                        else {
                          appui.menu.reloadTreeOfNode();
                          let treeNode = bbn.vue.closest(this.node, "bbn-tree-node");
                          if ( treeNode.numChildren === 1 ){
                            treeNode.numChildren = 0;
                          }
                        }
                      }
                    }
                    appui.success( bbn._("Deleted correctly") + '!!' );
                  }
                  else{
                    appui.error( bbn._("Error, not cleared correctly") + '!!' );
                  }
                }
              );
            }
          )
        }
      },
      /*
       * Add temporaney node
       *
       * @method addTempNode
       *
       * @param {Object} node information section where to add the temporary node
       * @param {Object} cfg information (text, id_parent, id_alias, icon, numChildren)
       */
      addTempNode(node, cfg){
        node.isExpanded = true;
        if ( node ){
          if( !node.numChildren ){
            this.$nextTick(() =>{
              node.numChildren = node.numChildren + 1;
            });
          }
          setTimeout(()=>{
            this.$nextTick(() => {
              node.$refs.tree[0].isLoaded= true;
            });
            this.formData.create = true;
            node.$refs.tree[0].items.push(cfg);
            setTimeout(()=>{
              node.$refs.tree[0].$children[node.$refs.tree[0].items.length - 1].isSelected = true;
            }, 150);
          }, 600);
        }
      },
      /*
       * Add temporaney node in root menu
       *
       * @method addTempNodeInRoot
       *
       * @param {Object} cfg information for node temporaney
       */
      addTempNodeInRoot(cfg){
        let tree = this.$refs.menus;
        if ( tree ){
          tree.items.push(cfg);
          tree.$forceUpdate();
          this.emptyMenuCurrent = false;
          this.formData.create = true;
          this.$nextTick(() =>{
            tree.$children[0].$children[tree.$children[0].$children.length - 1].isSelected = true;
          });
        }
        this.node = tree
      },
      //for form left
      /*
       * Open popup in form right which contains the icons to choose from
       *
       * @method openListIcons
       */
      openListIcons(){
        appui.$refs.tabnav.activeTab.getPopup().open({
          width: '80%',
          height: '80%',
          title: bbn._('Select icons'),
          component: 'appui-core-popup-iconpicker',
          source: {
            obj: appui.menu.selected,
            field: 'icon'
          }
        });
      },
      /*
       * Reload tree
       *
       * @method reloadTreeMenu
       */
      reloadTreeMenu(){
        // If the three-menu has been opened then it will update the component date again.
        if ( appui.$refs.menu.hasBeenOpened ){
         //update three-menu component
          appui.$refs.menu.hasBeenOpened = false;
          this.$nextTick(() =>{
            appui.$refs.menu.$refs.tree.isLoaded = false
          });
        }
      },
      moveNode(e, node, dest){
        bbn.fn.post(this.root + 'actions/move', {
          id: node.data.id,
          id_parent: dest.data.id
        }, d => {
          if( d.success ){
            appui.success(bbn._('Successfully moved') + ' !!');
          }
          else{
            appui.error(bbn._('Error moved') + '!!' );
          }
          dest.$refs.tree[0].reload();
          if ( dest.$refs.tree[0] !== node.parent ){
            node.parent.reload();
          }
        });
      },
      //reload sub tree
      reloadTreeOfNode(){
        if( this.node != null ){
          let treeOfNode = bbn.vue.closest(this.node, 'bbn-tree');
          treeOfNode.reload();
        }
      },
      successEditionMenu(d){
        this.formData.create= false;
        if( d.success ){
          setTimeout(()=>{
            this.selected= false;
            this.node.isSelected= false;
          }, 500);

          if( d.create  === true ){
            appui.success( bbn._("Successfully create") + '!!');
            this.emptyMenuCurrent = false;
          }
          if( d.create === false ){
            appui.error(bbn._("Error create"));
          }
          if ( d.id ){
            appui.success( bbn._("Successfully edit") + '!!');
          }
          /*setTimeout(()=>{
            this.$refs.menus.reload();
          },400);*/
        }
        else{
          appui.error(bbn._("Error!"));
        }
        //this.reloadTreeMenu();
        if ( this.node.parent.level === 0 && d.params ){

          let id = this.node['parent']['items'].length -1;

          $.each(d.params, (i, v)=>{
            this.node.$set(this.node['parent']['items'][id], i, v);
          });

        }
        else{
          this.reloadTreeOfNode();
        }
      },
      selectMenu(tree){
        /*if ( tree.data.id_alias === null ){
          this.viewButtonAlias = true;
        }*/
        this.node = tree;
        this.selected = false;
        this.$nextTick(() => {
          this.selected = {
            level: tree.level,
            text: tree.text,
            icon: tree.icon,
            num: tree.num,
            numChildren: tree.numChildren,
            id: tree.data.id,
            id_parent: tree.data.id_parent,
            id_alias: tree.data.id_alias,
            path: tree.data.path !== undefined ? tree.data.path : [],
            isExpanded: tree.isExpanded,
            isActive: tree.isActive,
            isMounted: tree.isMounted,
            isSelected: tree.isSelected,
            parentIsRoot: tree.parent.level === 0
          };
          if( tree.data.argument !== undefined ){
            this.selected.argument = tree.data.argument;
          }
          if ( this.$refs.form ){
            this.$refs.form.reinit();
          }
        });
      },
      selectPermission(node){
        this.$set(this.selected, "path", node.getPath());
        this.$set(this.selected, "id_alias", node.data.id);
      },
      formCancel(){
        if ( this.formData.create ){
          this.selected= false;

          setTimeout(()=>{
            this.$refs.menus.reload();
          },400);

          this.formData.create= false;
        }
        if ( this.$refs.treePermission ){
          this.$refs.treePermission.$emit('pathChange');

        }
        bbn.fn.log("formCancel", this.$refs.treePermission);
      },
      /** MAPPER OF TREE **/
      //menu tree mapper
      mapMenu(a){
        return {
          data: a,
          id: a.id,
          id_parent: a.id_parent,
          id_alias: a.id_alias,
          path: a.path || [],
          icon: a.icon,
          text: a.text,
          argument: a.argument,
          num: a.num_children || 0
        }
      },
      getPermissionsContext(node){
        let res = [];
        if ( node.icon === 'fas fa-file' ){
          res.push({
            text: 'Go',
            icon: 'far fa-hand-right',
            command(node){
              let path = node.getPath();
              bbn.fn.post('options/permissions', {
                id: node.data.id,
                full: 1
              }, (d) =>{
                bbn.fn.link(d.data.path);
              });
            }
          });
        }
        return res;
      },
      //Permitted tree mapper
      mapPermissions(a){
        a.text += ' &nbsp; <span class="bbn-grey">' +  "(" + a.code +  ")" + '</span>';
        return $.extend({selectable: a.icon === 'fas fa-file'}, a);
      },
      /** ##DRAG & DROP  **/

      /**
       * FOR MENU SPLITER LEFT
       */

      ctrlStartDrag(){
        bbn.fn.log("STArt DRAG", this, arguments);
        /* let node = arguments[0],
         event = arguments[1];
         if( (node.items.length) && (node.numChildren > 0) || (node.icon === 'fas fa-key') ){
         event.preventDefault();
         }*/
      },
      ctrlEndDrag(){
        bbn.fn.log("END DRAG",  arguments[0]);
        let node = arguments[0],
            event = arguments[1];
        /*
         if( (!node.items.length) && (node.numChildren === 0) && (node.icon !== 'fas fa-key') ){
         event.preventDefault();
         }
         */
      },
      /**
       *  FOR MENUS SPLITER RIGHT
       */
      ctrlStartDragMenus(node){
        bbn.fn.warning("START");
        bbn.fn.log(node, node.data, node.data.id_parent);
        //acquire the id of the node we want to move
        //this.idStartMove = node.data.id;
      },
      //activates when the node to be moved is released, it performs checks and, if necessary, performs the displacement action
      ctrlEndDragMenus(node, ev, destination){
        //The node shifts can do so all except the default menu that reside in the right splitter.

        if ( this.currentMenu !== this.id_default ){
          //acquire the id of the node that will contain that one we want to move

          bbn.fn.warning("end");
          bbn.fn.log(arguments, node, node.data,  node.data.id_parent, destination, ev);

          if ( node.data.code ){
            bbn.fn.post(this.root + 'actions/create_shortcut', {
              code: node.data.code,
              source: node.data.id,
              destination: destination.data.id
            })
          }
          else if ( node.data.id !== destination.data.id ){
            bbn.fn.post(this.root + "actions/move_menu", {
                id: node.data.id,
                id_parent: destination.data.id
              }, (d) => {
                if ( d.success ){
                  setTimeout( () => {
                    let tree = bbn.vue.find(destination, 'bbn-tree');
                    tree.reload();
                  }, 800);
                  appui.success(bbn._('It has been moved correctly'));
                }
                else{
                  appui.error(bbn._("It has not been moved correctly"));
                }
              }
            );
          }
        }
      }
    },

    watch:{
      /*
       * @watch currentMenu
       *
       * @set
       */
      currentMenu(val, old){
        for ( let i in this.list ){
          if ( this.list[i]['id'] === val ){
            this.idxListMenu = parseInt(i);
            this.emptyMenuCurrent = this.list[i]['num_children'] == 0;
          }
        }
        //keep track of the previous root
        this.oldRootMenu = old;
        if ( old && !val ){
          this.droppables.pop();
        }
        if ( !old && val ){
          this.$nextTick(() => {
            this.droppables.push(this.$refs.menus);
          });
        }
        else{
          this.$refs.menus.reload();
        }
        //Being that templete does not recharge at id change then we make a tree reload so we have the right menu
      },
    },
    mounted(){
      if ( this.$refs.menus ){
        this.droppables.push(this.$refs.menus);
      }
    },
    created(){
      appui.menu = this;
    }
  }
})();
