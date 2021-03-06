import { Component, OnInit } from '@angular/core';
import { SearchSiteService } from './search-sites.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DeleteComponent } from '../dialog/delete.component';
import { DialogService } from 'ng2-bootstrap-modal';

@Component({
  selector: 'app-search-sites',
  templateUrl: './search-sites.component.html',
  styleUrls: ['./search-sites.component.css']
})
export class SearchSitesComponent implements OnInit {
  sub: any

  sites: any = []
  account: any = {}
  createLoading: any = 0
  refreshLoading: any = 0
  private id: any

  constructor(private searchService: SearchSiteService, private dialogService: DialogService,
    private route: ActivatedRoute,  private router: Router) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id']; // (+) converts string 'id' to a number
      //lookup sites and account in parallel
      this.getSitesByAccountId(this.id)
      this.getAccountId(this.id)
    });

  }
  private ngOnDestroy() {
    this.sub.unsubscribe();
  }
  
  deleteAccount(accountId: string){
   this.searchService.deleteAccount(accountId).subscribe(result => {
     console.log("deleted account")
     //route home
     this.router.navigate(['/', result.id]);

   }) 
  }

  getAccountId(accountId: string){
    this.searchService.getAccountById(accountId).subscribe(result => {
        console.log("returned result account ", result)
        this.account = result;        
    })

  }
  getSitesByAccountId(accountId: string){
    this.searchService.getSitesPerAccount(accountId).subscribe(result => {
      console.log("returned result ", result)
      this.sites = result
    })
  
  }

  refresh(){
    this.sites = []
    this.refreshLoading = 1
    this.searchService.getSitesPerAccount(this.account.id).subscribe(result => {
      console.log("returned result ", result)
      this.sites = result
      this.refreshLoading = 0
    })
  }

  createSite(siteName: string){
    let newName = siteName.replace(/ /g,"").toLowerCase();
    //create request 
    let request = {
      email: this.account.email,
      //todo-this should be moved to the server side, wt crap was i thinking
      url: "http://" + newName + ".vssdevelopment.com",
      clientName: this.account.companyName,
      siteName: newName
    }
    //set loading
    this.createLoading = 1;
    this.searchService.createSite(request, this.account.id).subscribe(result => {
      console.log("returned result ", result)
      //refresh sites
      this.getSitesByAccountId(this.account.id)
      this.createLoading = 0;
    })
  }

  deleteSite(accountId: string, siteId: string){

    const disposable = this.dialogService.addDialog(DeleteComponent, {
      title: 'Delete',
      message: 'Are you sure you want to delete this site?',
      accountId: accountId,
      siteId: siteId})      
      .subscribe(() => {
          //We get dialog result
          disposable.unsubscribe();
          this.refresh();
      });
  }
}
